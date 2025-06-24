-- Migration: Create Beitragskalender Table (24.06.2025)
-- Automatische Kalender-Verwaltung für wiederkehrende Beiträge

-- Erweitere transaction_type ENUM für Beitragskalender-spezifische Typen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'beitragskalender_status') THEN
        CREATE TYPE beitragskalender_status AS ENUM (
            'scheduled',    -- Geplant/Vorgemerkt
            'processing',   -- In Bearbeitung
            'processed',    -- Erfolgreich verarbeitet
            'failed',       -- Fehlgeschlagen
            'cancelled',    -- Storniert
            'suspended'     -- Ausgesetzt (bei Pausierungen)
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kalender_created_by') THEN
        CREATE TYPE kalender_created_by AS ENUM (
            'auto_generator',    -- Automatisch beim Vertragsabschluss
            'manual',           -- Manuell durch Admin
            'contract_change',  -- Bei Vertragsänderung
            'module_addition',  -- Bei Modul-Hinzufügung
            'reactivation',     -- Bei Reaktivierung
            'system_trigger'    -- Systemgesteuert
        );
    END IF;
END $$;

-- Haupt-Tabelle: Beitragskalender
CREATE TABLE IF NOT EXISTS beitragskalender (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Referenzen
    member_id VARCHAR(50) NOT NULL,                    -- Mitglieds-ID
    vertrags_id VARCHAR(50),                          -- Vertrags-Referenz
    zahllaufgruppe_id VARCHAR(50),                    -- Zugehörige Zahlgruppe
    parent_entry_id UUID,                             -- Referenz für Teilzahlungen/Updates
    
    -- Kalender-Daten
    due_date DATE NOT NULL,                           -- Fälligkeitsdatum
    transaction_type transaction_type NOT NULL,        -- Typ der Transaktion
    amount DECIMAL(10,2) NOT NULL,                    -- Betrag in Euro
    description TEXT,                                 -- Beschreibung (auto-generiert)
    
    -- Status und Verarbeitung
    status beitragskalender_status DEFAULT 'scheduled',
    created_by kalender_created_by DEFAULT 'auto_generator',
    
    -- Rekurrenz-Information
    is_recurring BOOLEAN DEFAULT true,                -- Ist wiederkehrend
    recurrence_pattern VARCHAR(20),                   -- monthly, quarterly, yearly, weekly
    recurrence_end_date DATE,                         -- Ende der Wiederkehrung
    
    -- Verarbeitungs-Details
    processed_at TIMESTAMPTZ,                         -- Zeitpunkt der Verarbeitung
    processing_result JSONB,                          -- Ergebnis der Verarbeitung
    retry_count INTEGER DEFAULT 0,                    -- Anzahl Wiederholungsversuche
    error_message TEXT,                               -- Fehlermeldung bei Fehlschlag
    
    -- Sales-Tool Integration (wie in anderen Tabellen)
    sales_tool_reference_id VARCHAR(100),             -- Externe Referenz-ID
    sales_tool_origin VARCHAR(50),                    -- Herkunftssystem
    business_logic_trigger VARCHAR(100),              -- Trigger für Geschäftslogik
    
    -- Zusatz-Informationen
    notes TEXT,                                       -- Admin-Notizen
    tags VARCHAR(200),                                -- Tags für Kategorisierung
    priority INTEGER DEFAULT 1,                       -- Priorität (1=niedrig, 5=hoch)
    
    -- Audit-Felder
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by_user UUID,                             -- Benutzer der den Eintrag erstellt hat
    updated_by_user UUID                              -- Letzter Bearbeiter
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_beitragskalender_member_id ON beitragskalender(member_id);
CREATE INDEX IF NOT EXISTS idx_beitragskalender_due_date ON beitragskalender(due_date);
CREATE INDEX IF NOT EXISTS idx_beitragskalender_status ON beitragskalender(status);
CREATE INDEX IF NOT EXISTS idx_beitragskalender_zahllaufgruppe ON beitragskalender(zahllaufgruppe_id);
CREATE INDEX IF NOT EXISTS idx_beitragskalender_vertrags ON beitragskalender(vertrags_id);
CREATE INDEX IF NOT EXISTS idx_beitragskalender_type ON beitragskalender(transaction_type);
CREATE INDEX IF NOT EXISTS idx_beitragskalender_recurring ON beitragskalender(is_recurring, recurrence_pattern);

-- Composite Index für häufige Abfragen
CREATE INDEX IF NOT EXISTS idx_beitragskalender_member_date_status 
ON beitragskalender(member_id, due_date, status);

-- Fremdschlüssel-Constraints (falls die Tabellen existieren)
-- ALTER TABLE beitragskalender 
-- ADD CONSTRAINT fk_beitragskalender_member 
-- FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;

-- Constraints
ALTER TABLE beitragskalender 
ADD CONSTRAINT chk_beitragskalender_amount_positive 
CHECK (amount >= 0);

ALTER TABLE beitragskalender 
ADD CONSTRAINT chk_beitragskalender_due_date_future 
CHECK (due_date >= CURRENT_DATE - INTERVAL '1 year'); -- Max 1 Jahr rückwirkend

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_beitragskalender_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_beitragskalender_updated_at
    BEFORE UPDATE ON beitragskalender
    FOR EACH ROW
    EXECUTE FUNCTION update_beitragskalender_updated_at();

-- RLS (Row Level Security) - Optional
ALTER TABLE beitragskalender ENABLE ROW LEVEL SECURITY;

-- Policy für Service Role (voller Zugriff)
CREATE POLICY "Service role can manage beitragskalender" ON beitragskalender
FOR ALL USING (auth.role() = 'service_role');

-- Policy für Authenticated Users (Lesen eigener Daten)
CREATE POLICY "Users can view own beitragskalender" ON beitragskalender
FOR SELECT USING (auth.uid()::text = member_id);

-- View für vereinfachte Abfragen
CREATE OR REPLACE VIEW beitragskalender_overview AS
SELECT 
    b.id,
    b.member_id,
    b.vertrags_id,
    b.due_date,
    b.transaction_type,
    b.amount,
    b.description,
    b.status,
    b.is_recurring,
    b.recurrence_pattern,
    b.zahllaufgruppe_id,
    b.created_by,
    b.processed_at,
    b.created_at,
    
    -- Berechnete Felder
    CASE 
        WHEN b.due_date < CURRENT_DATE AND b.status = 'scheduled' THEN 'overdue'
        WHEN b.due_date = CURRENT_DATE AND b.status = 'scheduled' THEN 'due_today'
        WHEN b.due_date > CURRENT_DATE AND b.status = 'scheduled' THEN 'upcoming'
        ELSE b.status::text
    END as effective_status,
    
    EXTRACT(DAYS FROM (b.due_date - CURRENT_DATE)) as days_until_due,
    
    -- Gruppierung nach Monat/Jahr
    TO_CHAR(b.due_date, 'YYYY-MM') as due_month,
    TO_CHAR(b.due_date, 'YYYY') as due_year
    
FROM beitragskalender b
ORDER BY b.due_date ASC, b.created_at ASC;

-- Funktionen für Kalender-Management

-- Funktion: Generiere Kalender für ein Mitglied
CREATE OR REPLACE FUNCTION generate_member_beitragskalender(
    p_member_id VARCHAR(50),
    p_vertrags_id VARCHAR(50),
    p_start_date DATE,
    p_end_date DATE,
    p_base_amount DECIMAL(10,2),
    p_transaction_types transaction_type[],
    p_payment_schedule VARCHAR(20) DEFAULT 'monthly',
    p_zahllaufgruppe_id VARCHAR(50) DEFAULT 'default_group'
)
RETURNS TABLE(
    created_count INTEGER,
    total_amount DECIMAL(10,2),
    first_due_date DATE,
    last_due_date DATE
) AS $$
DECLARE
    current_date DATE := p_start_date;
    interval_value INTERVAL;
    transaction_type transaction_type;
    entry_amount DECIMAL(10,2);
    created_entries INTEGER := 0;
    total_sum DECIMAL(10,2) := 0;
BEGIN
    -- Bestimme Intervall basierend auf Zahlungsrhythmus
    CASE p_payment_schedule
        WHEN 'weekly' THEN interval_value := '1 week'::INTERVAL;
        WHEN 'monthly' THEN interval_value := '1 month'::INTERVAL;
        WHEN 'quarterly' THEN interval_value := '3 months'::INTERVAL;
        WHEN 'yearly' THEN interval_value := '1 year'::INTERVAL;
        ELSE interval_value := '1 month'::INTERVAL;
    END CASE;

    -- Erstelle Einträge für jeden Transaktionstyp und jedes Fälligkeitsdatum
    WHILE current_date <= p_end_date LOOP
        FOREACH transaction_type IN ARRAY p_transaction_types LOOP
            -- Berechne spezifischen Betrag für diesen Typ
            entry_amount := p_base_amount * 
                CASE transaction_type
                    WHEN 'membership_fee' THEN 1.0
                    WHEN 'pauschale' THEN 0.5
                    WHEN 'modul' THEN 0.3
                    WHEN 'setup_fee' THEN 2.0
                    WHEN 'penalty_fee' THEN 0.1
                    ELSE 1.0
                END;

            -- Erstelle Kalendereintrag
            INSERT INTO beitragskalender (
                member_id,
                vertrags_id,
                due_date,
                transaction_type,
                amount,
                description,
                zahllaufgruppe_id,
                recurrence_pattern,
                recurrence_end_date,
                created_by
            ) VALUES (
                p_member_id,
                p_vertrags_id,
                current_date,
                transaction_type,
                entry_amount,
                transaction_type || ' ' || TO_CHAR(current_date, 'Month YYYY'),
                p_zahllaufgruppe_id,
                p_payment_schedule,
                p_end_date,
                'auto_generator'
            );

            created_entries := created_entries + 1;
            total_sum := total_sum + entry_amount;
        END LOOP;

        current_date := current_date + interval_value;
    END LOOP;

    RETURN QUERY SELECT 
        created_entries,
        total_sum,
        p_start_date,
        p_end_date;
END;
$$ LANGUAGE plpgsql; 