-- Migration 001: Vertragsarten-System V2 - Komplette Datenbankstruktur
-- Erstellt alle neuen Tabellen parallel zu bestehenden contract_types

-- ============================================================================
-- PHASE 1: HAUPTTABELLEN ERSTELLEN
-- ============================================================================

-- 1. CONTRACTS (Haupt-Verträge mit Versionierung)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Versionierungs-System
    contract_group_id UUID NOT NULL, -- Gruppiert alle Versionen
    version_number INTEGER NOT NULL DEFAULT 1,
    version_note TEXT, -- Änderungsnotiz (auto + manuell)
    is_active BOOLEAN DEFAULT false, -- Nur eine Version pro Gruppe aktiv
    created_from_version_id UUID REFERENCES public.contracts(id),
    
    -- Basis-Informationen
    name TEXT NOT NULL,
    description TEXT,
    
    -- Kampagnen-System
    is_campaign_version BOOLEAN DEFAULT false,
    campaign_id UUID REFERENCES public.campaigns(id),
    campaign_extension_date DATE, -- Bei Verlängerung
    base_version_id UUID REFERENCES public.contracts(id), -- Referenz auf Original
    auto_reactivate_version_id UUID REFERENCES public.contracts(id), -- Nach Kampagne
    
    -- Vertragsbedingungen
    auto_renew BOOLEAN DEFAULT false,
    renewal_term_months INTEGER,
    cancellation_period INTEGER DEFAULT 30,
    cancellation_unit TEXT DEFAULT 'days', -- 'days', 'months'
    
    -- Rabatte
    group_discount_enabled BOOLEAN DEFAULT false,
    group_discount_type TEXT, -- 'percent', 'fixed'
    group_discount_value DECIMAL(10,2),
    
    -- Zahlungseinstellungen
    payment_runs TEXT, -- Dropdown (später definiert)
    payment_methods TEXT[], -- ['lastschrift', 'überweisung']
    
    -- Metadaten
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    -- Constraints
    UNIQUE(contract_group_id, version_number),
    CHECK (version_number > 0),
    CHECK (cancellation_period > 0),
    CHECK (group_discount_type IN ('percent', 'fixed') OR group_discount_type IS NULL),
    CHECK (cancellation_unit IN ('days', 'months'))
);

-- 2. CONTRACT_TERMS (Laufzeiten pro Vertrag)
CREATE TABLE IF NOT EXISTS public.contract_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    duration_months INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT now(),
    
    -- Constraints
    UNIQUE(contract_id, duration_months),
    CHECK (duration_months > 0),
    CHECK (base_price >= 0)
);

-- 3. CONTRACT_PRICING (Preisdynamiken)
CREATE TABLE IF NOT EXISTS public.contract_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL, -- Bezeichnung der Preisanpassung
    pricing_type TEXT NOT NULL, -- 'einmalig', 'stichtag', 'wiederholend'
    
    -- Für Stichtag-Preise
    trigger_type TEXT, -- 'monthly_first', 'manual_date'
    trigger_date DATE, -- Bei manual_date
    trigger_day INTEGER, -- Tag im Monat (1-31)
    
    -- Für wiederholende Preise  
    repeat_interval TEXT, -- 'monthly', 'yearly'
    repeat_after_months INTEGER, -- Nach X Monaten starten
    
    -- Preisanpassung
    adjustment_type TEXT NOT NULL, -- 'fixed_amount', 'percentage'
    adjustment_value DECIMAL(10,2) NOT NULL,
    
    -- Gültigkeit
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT now(),
    
    -- Constraints
    CHECK (pricing_type IN ('einmalig', 'stichtag', 'wiederholend')),
    CHECK (adjustment_type IN ('fixed_amount', 'percentage')),
    CHECK (trigger_day IS NULL OR (trigger_day >= 1 AND trigger_day <= 31)),
    CHECK (repeat_interval IN ('monthly', 'yearly') OR repeat_interval IS NULL),
    CHECK (trigger_type IN ('monthly_first', 'manual_date') OR trigger_type IS NULL)
);

-- 4. CONTRACT_STARTER_PACKAGES (Startpakete)
CREATE TABLE IF NOT EXISTS public.contract_starter_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT now(),
    
    CHECK (price >= 0)
);

-- 5. CONTRACT_FLAT_RATES (Pauschalen)
CREATE TABLE IF NOT EXISTS public.contract_flat_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_type TEXT DEFAULT 'monthly', -- 'monthly', 'yearly', 'once'
    is_mandatory BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT now(),
    
    CHECK (price >= 0),
    CHECK (billing_type IN ('monthly', 'yearly', 'once'))
);

-- ============================================================================
-- PHASE 2: MODUL-SYSTEM TABELLEN
-- ============================================================================

-- 6. MODULE_CATEGORIES (Modul-Kategorien)
CREATE TABLE IF NOT EXISTS public.module_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT, -- Lucide Icon Name
    color TEXT, -- Tailwind Color Name
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT now()
);

-- 7. CONTRACT_MODULES (Module mit Kategorien)
CREATE TABLE IF NOT EXISTS public.contract_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name TEXT NOT NULL,
    description TEXT,
    price_per_month DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Kategorisierung
    category_id UUID REFERENCES public.module_categories(id),
    icon_name TEXT, -- Lucide Icon Name
    icon_file_asset_id UUID REFERENCES public.file_asset(id), -- Eigenes Icon
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadaten
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    CHECK (price_per_month >= 0)
);

-- 8. CONTRACT_MODULE_ASSIGNMENTS (Modul ↔ Vertrag)
CREATE TABLE IF NOT EXISTS public.contract_module_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.contract_modules(id) ON DELETE CASCADE,
    
    assignment_type TEXT NOT NULL, -- 'included', 'optional'
    custom_price DECIMAL(10,2), -- Überschreibt Modulpreis
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(contract_id, module_id),
    CHECK (assignment_type IN ('included', 'optional')),
    CHECK (custom_price IS NULL OR custom_price >= 0)
);

-- ============================================================================
-- PHASE 3: VERTRAGSDOKUMENTE TABELLEN  
-- ============================================================================

-- 9. CONTRACT_DOCUMENTS (WYSIWYG-Dokumente)
CREATE TABLE IF NOT EXISTS public.contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dokument-Info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Versionierung (ähnlich wie contracts)
    document_group_id UUID NOT NULL,
    version_number INTEGER DEFAULT 1,
    version_note TEXT,
    is_active BOOLEAN DEFAULT false,
    created_from_version_id UUID REFERENCES public.contract_documents(id),
    
    -- Anzeige-Optionen
    show_payment_calendar BOOLEAN DEFAULT false,
    show_service_content BOOLEAN DEFAULT false, -- Leistungsinhalt
    show_member_data BOOLEAN DEFAULT true, -- Stammdaten
    
    -- Template-Einstellungen
    header_template TEXT, -- HTML für Kopfzeile
    footer_template TEXT, -- HTML für Fußzeile
    css_styles TEXT, -- Custom CSS für PDF
    
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(document_group_id, version_number),
    CHECK (version_number > 0)
);

-- 10. CONTRACT_DOCUMENT_SECTIONS (Dokumentabschnitte)
CREATE TABLE IF NOT EXISTS public.contract_document_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    document_id UUID REFERENCES public.contract_documents(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- HTML vom WYSIWYG-Editor
    sort_order INTEGER DEFAULT 0,
    
    -- Abschnitts-Eigenschaften
    is_mandatory BOOLEAN DEFAULT false,
    requires_signature BOOLEAN DEFAULT false,
    display_as_checkbox BOOLEAN DEFAULT false,
    
    -- Bedingte Anzeige
    show_condition JSONB, -- {field: 'campaign', operator: 'equals', value: true}
    
    created_at TIMESTAMP DEFAULT now()
);

-- 11. CONTRACT_DOCUMENT_ASSIGNMENTS (Dokument ↔ Vertrag)
CREATE TABLE IF NOT EXISTS public.contract_document_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.contract_documents(id) ON DELETE CASCADE,
    
    -- Überschreibungen pro Vertrag
    override_settings JSONB, -- {show_payment_calendar: true, custom_header: "..."}
    
    created_at TIMESTAMP DEFAULT now(),
    
    UNIQUE(contract_id, document_id)
);

-- ============================================================================
-- PHASE 4: INDIZES FÜR PERFORMANCE
-- ============================================================================

-- Contracts Indizes
CREATE INDEX IF NOT EXISTS idx_contracts_group_active ON public.contracts(contract_group_id, is_active);
CREATE INDEX IF NOT EXISTS idx_contracts_campaign ON public.contracts(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_version ON public.contracts(contract_group_id, version_number);
CREATE INDEX IF NOT EXISTS idx_contracts_active_versions ON public.contracts(contract_group_id) WHERE is_active = true;

-- Contract Terms Indizes
CREATE INDEX IF NOT EXISTS idx_contract_terms_contract ON public.contract_terms(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_terms_duration ON public.contract_terms(duration_months);

-- Module Indizes
CREATE INDEX IF NOT EXISTS idx_contract_modules_category ON public.contract_modules(category_id);
CREATE INDEX IF NOT EXISTS idx_contract_modules_active ON public.contract_modules(is_active);

-- Module Assignments Indizes  
CREATE INDEX IF NOT EXISTS idx_module_assignments_contract ON public.contract_module_assignments(contract_id);
CREATE INDEX IF NOT EXISTS idx_module_assignments_module ON public.contract_module_assignments(module_id);
CREATE INDEX IF NOT EXISTS idx_module_assignments_type ON public.contract_module_assignments(assignment_type);

-- Document Indizes
CREATE INDEX IF NOT EXISTS idx_contract_documents_group ON public.contract_documents(document_group_id);
CREATE INDEX IF NOT EXISTS idx_contract_documents_active ON public.contract_documents(document_group_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_document_sections_order ON public.contract_document_sections(document_id, sort_order);

-- Document Assignments Indizes
CREATE INDEX IF NOT EXISTS idx_document_assignments_contract ON public.contract_document_assignments(contract_id);
CREATE INDEX IF NOT EXISTS idx_document_assignments_document ON public.contract_document_assignments(document_id);

-- Volltext-Suche Indizes
CREATE INDEX IF NOT EXISTS idx_contracts_search ON public.contracts USING gin(to_tsvector('german', name || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_modules_search ON public.contract_modules USING gin(to_tsvector('german', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- PHASE 5: TRIGGERS FÜR AUTOMATISCHE UPDATES
-- ============================================================================

-- Trigger-Funktion für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at Triggers
DROP TRIGGER IF EXISTS update_contracts_updated_at ON public.contracts;
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON public.contracts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_modules_updated_at ON public.contract_modules;
CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON public.contract_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documents_updated_at ON public.contract_documents;
CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON public.contract_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PHASE 6: KOMMENTARE FÜR DOKUMENTATION
-- ============================================================================

-- Tabellen-Kommentare
COMMENT ON TABLE public.contracts IS 'Verträge mit Versionierung und Kampagnenlogik';
COMMENT ON TABLE public.contract_terms IS 'Laufzeiten und Preise pro Vertrag';
COMMENT ON TABLE public.contract_pricing IS 'Preisdynamiken (Stichtag, wiederholend)';
COMMENT ON TABLE public.contract_starter_packages IS 'Startpakete für Verträge';
COMMENT ON TABLE public.contract_flat_rates IS 'Pauschalen pro Vertrag';

COMMENT ON TABLE public.module_categories IS 'Kategorien für Module (Training, Wellness, etc.)';
COMMENT ON TABLE public.contract_modules IS 'Module mit Icons und Kategorien';
COMMENT ON TABLE public.contract_module_assignments IS 'Zuordnung Module zu Verträgen';

COMMENT ON TABLE public.contract_documents IS 'WYSIWYG-Vertragsdokumente mit Versionierung';
COMMENT ON TABLE public.contract_document_sections IS 'Abschnitte der Vertragsdokumente';
COMMENT ON TABLE public.contract_document_assignments IS 'Zuordnung Dokumente zu Verträgen';

-- Spalten-Kommentare (wichtigste)
COMMENT ON COLUMN public.contracts.contract_group_id IS 'Gruppiert alle Versionen eines Vertrags';
COMMENT ON COLUMN public.contracts.version_number IS 'Versionsnummer (1, 2, 3, ...)';
COMMENT ON COLUMN public.contracts.is_campaign_version IS 'Spezielle Kampagnenversion';
COMMENT ON COLUMN public.contracts.auto_reactivate_version_id IS 'Version die nach Kampagne aktiviert wird';

COMMENT ON COLUMN public.contract_pricing.pricing_type IS 'einmalig | stichtag | wiederholend';
COMMENT ON COLUMN public.contract_pricing.adjustment_type IS 'fixed_amount | percentage';

COMMENT ON COLUMN public.contract_modules.icon_name IS 'Lucide Icon Name (z.B. Dumbbell)';
COMMENT ON COLUMN public.contract_modules.icon_file_asset_id IS 'Custom Icon aus Dateimanager';

-- ============================================================================
-- ERFOLGSMELDUNG
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Vertragsarten-System V2 Datenbankstruktur erfolgreich erstellt!';
    RAISE NOTICE '📊 Erstellt: 11 Tabellen, 15+ Indizes, 3 Triggers';
    RAISE NOTICE '🔄 Nächster Schritt: Standard-Daten einfügen (Migration 002)';
END $$;