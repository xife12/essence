-- Payment System Tables Migration
-- Diese Migration erstellt alle Tabellen für das Payment-System

-- 1. Payment Groups (Zahlungsgruppen)
CREATE TABLE IF NOT EXISTS public.payment_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    payment_day INTEGER NOT NULL CHECK (payment_day BETWEEN 1 AND 28),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Payment Members (Mitglieder im Payment-System)
CREATE TABLE IF NOT EXISTS public.payment_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID, -- FK to members table (optional)
    member_number TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    birth_date DATE,
    iban TEXT,
    bic TEXT, -- BIC Spalte hinzugefügt
    mandate_reference TEXT,
    payment_group_id UUID REFERENCES public.payment_groups(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Member Accounts (Konten der Mitglieder)
CREATE TABLE IF NOT EXISTS public.member_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_member_id UUID NOT NULL REFERENCES public.payment_members(id) ON DELETE CASCADE,
    current_balance DECIMAL(10,2) DEFAULT 0.00,
    last_payment_date DATE,
    next_payment_due DATE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Payment Runs (SEPA-Zahlungsläufe)
CREATE TABLE IF NOT EXISTS public.payment_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    payment_group_id UUID NOT NULL REFERENCES public.payment_groups(id),
    run_date DATE NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'prepared', 'submitted', 'completed', 'failed')),
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    member_count INTEGER DEFAULT 0,
    sepa_xml_generated BOOLEAN DEFAULT false,
    sepa_xml_path TEXT,
    created_by UUID, -- FK to staff table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Payment Run Items (Einzelne Zahlungen in einem Lauf)
CREATE TABLE IF NOT EXISTS public.payment_run_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_run_id UUID NOT NULL REFERENCES public.payment_runs(id) ON DELETE CASCADE,
    payment_member_id UUID NOT NULL REFERENCES public.payment_members(id),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed', 'cancelled')),
    error_message TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Member Transactions (Kontobuchungen)
CREATE TABLE IF NOT EXISTS public.member_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_member_id UUID NOT NULL REFERENCES public.payment_members(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('payment_received', 'fee_charged', 'correction', 'refund', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_run_id UUID REFERENCES public.payment_runs(id),
    created_by UUID, -- FK to staff table
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Studio Settings (Studio-Konfiguration)
CREATE TABLE IF NOT EXISTS public.studio_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    studio_name TEXT NOT NULL,
    studio_address TEXT,
    bank_name TEXT,
    bank_iban TEXT,
    bank_bic TEXT,
    creditor_id TEXT, -- SEPA Creditor ID
    sepa_mandate_text TEXT,
    payment_reference_prefix TEXT DEFAULT 'MEMBER',
    auto_payment_enabled BOOLEAN DEFAULT false,
    payment_retry_days INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_payment_members_member_number ON public.payment_members(member_number);
CREATE INDEX IF NOT EXISTS idx_payment_members_payment_group ON public.payment_members(payment_group_id);
CREATE INDEX IF NOT EXISTS idx_member_accounts_payment_member ON public.member_accounts(payment_member_id);
CREATE INDEX IF NOT EXISTS idx_member_transactions_payment_member ON public.member_transactions(payment_member_id);
CREATE INDEX IF NOT EXISTS idx_member_transactions_date ON public.member_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_payment_run_items_run_id ON public.payment_run_items(payment_run_id);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_groups_updated_at BEFORE UPDATE ON public.payment_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_members_updated_at BEFORE UPDATE ON public.payment_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_runs_updated_at BEFORE UPDATE ON public.payment_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_studio_settings_updated_at BEFORE UPDATE ON public.studio_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Automatischer Balance-Update bei Transaktionen
CREATE OR REPLACE FUNCTION update_member_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the current balance in member_accounts
    UPDATE public.member_accounts 
    SET 
        current_balance = current_balance + NEW.amount,
        last_updated = NOW()
    WHERE payment_member_id = NEW.payment_member_id;
    
    -- If no account exists, create one
    IF NOT FOUND THEN
        INSERT INTO public.member_accounts (payment_member_id, current_balance, last_updated)
        VALUES (NEW.payment_member_id, NEW.amount, NOW());
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_balance_on_transaction 
    AFTER INSERT ON public.member_transactions 
    FOR EACH ROW EXECUTE FUNCTION update_member_balance();

-- Beispiel-Daten für Payment Groups
INSERT INTO public.payment_groups (name, description, payment_day) VALUES 
    ('Monatsanfang', 'Abbuchung am 1. des Monats', 1),
    ('Monatsmitte', 'Abbuchung am 15. des Monats', 15),
    ('Monatsende', 'Abbuchung am 28. des Monats', 28)
ON CONFLICT DO NOTHING;

-- Standard Studio Settings
INSERT INTO public.studio_settings (studio_name, payment_reference_prefix, auto_payment_enabled, payment_retry_days) VALUES 
    ('Fitness Studio', 'MEMBER', false, 7)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE public.payment_members IS 'Mitglieder im Payment-System mit SEPA-Daten';
COMMENT ON TABLE public.member_accounts IS 'Kontostand und Zahlungsinformationen pro Mitglied';
COMMENT ON TABLE public.member_transactions IS 'Alle Kontobewegungen (Zahlungen, Gebühren, Korrekturen)';
COMMENT ON TABLE public.payment_groups IS 'Zahlungsgruppen für verschiedene Abbuchungstage';
COMMENT ON TABLE public.payment_runs IS 'SEPA-Zahlungsläufe';
COMMENT ON TABLE public.payment_run_items IS 'Einzelne Zahlungen innerhalb eines Zahlungslaufs';
COMMENT ON TABLE public.studio_settings IS 'Studio-Konfiguration für SEPA-Zahlungen'; 