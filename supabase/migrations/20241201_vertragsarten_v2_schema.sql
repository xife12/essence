-- Migration: Vertragsarten-System V2 für Supabase
-- Datum: 2024-12-01
-- Beschreibung: Komplette Datenbankstruktur für das neue Vertragsarten-System

-- ============================================================================
-- SCHEMA SETUP
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- HAUPTTABELLEN
-- ============================================================================

-- 1. CONTRACTS (Haupt-Verträge mit Versionierung)
CREATE TABLE public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Versionierungs-System
    contract_group_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    version_note TEXT,
    is_active BOOLEAN DEFAULT false,
    created_from_version_id UUID REFERENCES public.contracts(id),
    
    -- Basis-Informationen
    name TEXT NOT NULL,
    description TEXT,
    
    -- Kampagnen-System
    is_campaign_version BOOLEAN DEFAULT false,
    campaign_id UUID REFERENCES public.campaigns(id),
    campaign_extension_date DATE,
    base_version_id UUID REFERENCES public.contracts(id),
    auto_reactivate_version_id UUID REFERENCES public.contracts(id),
    
    -- Vertragsbedingungen
    auto_renew BOOLEAN DEFAULT false,
    renewal_term_months INTEGER,
    cancellation_period INTEGER DEFAULT 30,
    cancellation_unit TEXT DEFAULT 'days',
    
    -- Rabatte
    group_discount_enabled BOOLEAN DEFAULT false,
    group_discount_type TEXT,
    group_discount_value DECIMAL(10,2),
    
    -- Zahlungseinstellungen
    payment_runs TEXT,
    payment_methods TEXT[],
    
    -- Metadaten
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(contract_group_id, version_number),
    CHECK (version_number > 0),
    CHECK (cancellation_period > 0),
    CHECK (group_discount_type IN ('percent', 'fixed') OR group_discount_type IS NULL),
    CHECK (cancellation_unit IN ('days', 'months'))
);

-- 2. CONTRACT_TERMS (Laufzeiten pro Vertrag)
CREATE TABLE public.contract_terms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    duration_months INTEGER NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(contract_id, duration_months),
    CHECK (duration_months > 0),
    CHECK (base_price >= 0)
);

-- 3. CONTRACT_PRICING (Preisdynamiken)
CREATE TABLE public.contract_pricing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    pricing_type TEXT NOT NULL,
    
    -- Stichtag-spezifisch
    trigger_type TEXT,
    trigger_date DATE,
    trigger_day INTEGER,
    
    -- Wiederholend-spezifisch
    repeat_interval TEXT,
    repeat_after_months INTEGER,
    
    -- Preisanpassung
    adjustment_type TEXT NOT NULL,
    adjustment_value DECIMAL(10,2) NOT NULL,
    
    -- Gültigkeit
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CHECK (pricing_type IN ('einmalig', 'stichtag', 'wiederholend')),
    CHECK (adjustment_type IN ('fixed_amount', 'percentage')),
    CHECK (trigger_day IS NULL OR (trigger_day >= 1 AND trigger_day <= 31)),
    CHECK (repeat_interval IN ('monthly', 'yearly') OR repeat_interval IS NULL),
    CHECK (trigger_type IN ('monthly_first', 'manual_date') OR trigger_type IS NULL)
);

-- 4. CONTRACT_STARTER_PACKAGES (Startpakete)
CREATE TABLE public.contract_starter_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    is_mandatory BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CHECK (price >= 0)
);

-- 5. CONTRACT_FLAT_RATES (Pauschalen)
CREATE TABLE public.contract_flat_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_type TEXT DEFAULT 'monthly',
    is_mandatory BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CHECK (price >= 0),
    CHECK (billing_type IN ('monthly', 'yearly', 'once'))
);

-- ============================================================================
-- MODUL-SYSTEM TABELLEN
-- ============================================================================

-- 6. MODULE_CATEGORIES (Modul-Kategorien)
CREATE TABLE public.module_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. CONTRACT_MODULES (Module mit Kategorien)
CREATE TABLE public.contract_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    name TEXT NOT NULL,
    description TEXT,
    price_per_month DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Kategorisierung
    category_id UUID REFERENCES public.module_categories(id),
    icon_name TEXT,
    icon_file_asset_id UUID REFERENCES public.file_asset(id),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadaten
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CHECK (price_per_month >= 0)
);

-- 8. CONTRACT_MODULE_ASSIGNMENTS (Modul ↔ Vertrag)
CREATE TABLE public.contract_module_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.contract_modules(id) ON DELETE CASCADE,
    
    assignment_type TEXT NOT NULL,
    custom_price DECIMAL(10,2),
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(contract_id, module_id),
    CHECK (assignment_type IN ('included', 'optional')),
    CHECK (custom_price IS NULL OR custom_price >= 0)
);

-- ============================================================================
-- VERTRAGSDOKUMENTE TABELLEN
-- ============================================================================

-- 9. CONTRACT_DOCUMENTS (WYSIWYG-Dokumente)
CREATE TABLE public.contract_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Dokument-Info
    name TEXT NOT NULL,
    description TEXT,
    
    -- Versionierung
    document_group_id UUID NOT NULL,
    version_number INTEGER DEFAULT 1,
    version_note TEXT,
    is_active BOOLEAN DEFAULT false,
    created_from_version_id UUID REFERENCES public.contract_documents(id),
    
    -- Anzeige-Optionen
    show_payment_calendar BOOLEAN DEFAULT false,
    show_service_content BOOLEAN DEFAULT false,
    show_member_data BOOLEAN DEFAULT true,
    
    -- Template-Einstellungen
    header_template TEXT,
    footer_template TEXT,
    css_styles TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(document_group_id, version_number),
    CHECK (version_number > 0)
);

-- 10. CONTRACT_DOCUMENT_SECTIONS (Dokumentabschnitte)
CREATE TABLE public.contract_document_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    document_id UUID REFERENCES public.contract_documents(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    
    -- Abschnitts-Eigenschaften
    is_mandatory BOOLEAN DEFAULT false,
    requires_signature BOOLEAN DEFAULT false,
    display_as_checkbox BOOLEAN DEFAULT false,
    
    -- Bedingte Anzeige
    show_condition JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. CONTRACT_DOCUMENT_ASSIGNMENTS (Dokument ↔ Vertrag)
CREATE TABLE public.contract_document_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    document_id UUID REFERENCES public.contract_documents(id) ON DELETE CASCADE,
    
    -- Überschreibungen pro Vertrag
    override_settings JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(contract_id, document_id)
);

-- ============================================================================
-- INDIZES FÜR PERFORMANCE
-- ============================================================================

-- Contracts Indizes
CREATE INDEX idx_contracts_group_active ON public.contracts(contract_group_id, is_active);
CREATE INDEX idx_contracts_campaign ON public.contracts(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX idx_contracts_version ON public.contracts(contract_group_id, version_number);
CREATE INDEX idx_contracts_active_versions ON public.contracts(contract_group_id) WHERE is_active = true;

-- Contract Terms Indizes
CREATE INDEX idx_contract_terms_contract ON public.contract_terms(contract_id);
CREATE INDEX idx_contract_terms_duration ON public.contract_terms(duration_months);

-- Module Indizes
CREATE INDEX idx_contract_modules_category ON public.contract_modules(category_id);
CREATE INDEX idx_contract_modules_active ON public.contract_modules(is_active);

-- Module Assignments Indizes
CREATE INDEX idx_module_assignments_contract ON public.contract_module_assignments(contract_id);
CREATE INDEX idx_module_assignments_module ON public.contract_module_assignments(module_id);
CREATE INDEX idx_module_assignments_type ON public.contract_module_assignments(assignment_type);

-- Document Indizes
CREATE INDEX idx_contract_documents_group ON public.contract_documents(document_group_id);
CREATE INDEX idx_contract_documents_active ON public.contract_documents(document_group_id) WHERE is_active = true;
CREATE INDEX idx_document_sections_order ON public.contract_document_sections(document_id, sort_order);

-- Document Assignments Indizes
CREATE INDEX idx_document_assignments_contract ON public.contract_document_assignments(contract_id);
CREATE INDEX idx_document_assignments_document ON public.contract_document_assignments(document_id);

-- Volltext-Suche Indizes
CREATE INDEX idx_contracts_search ON public.contracts USING gin(to_tsvector('german', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_modules_search ON public.contract_modules USING gin(to_tsvector('german', name || ' ' || COALESCE(description, '')));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger-Funktion für updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated_at Triggers
CREATE TRIGGER update_contracts_updated_at 
    BEFORE UPDATE ON public.contracts 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_modules_updated_at 
    BEFORE UPDATE ON public.contract_modules 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON public.contract_documents 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_starter_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_flat_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_document_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies für alle Tabellen
-- Alle authenticated users können lesen
CREATE POLICY "contracts_select_policy" ON public.contracts FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_terms_select_policy" ON public.contract_terms FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_pricing_select_policy" ON public.contract_pricing FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_starter_packages_select_policy" ON public.contract_starter_packages FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_flat_rates_select_policy" ON public.contract_flat_rates FOR SELECT TO authenticated USING (true);
CREATE POLICY "module_categories_select_policy" ON public.module_categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_modules_select_policy" ON public.contract_modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_module_assignments_select_policy" ON public.contract_module_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_documents_select_policy" ON public.contract_documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_document_sections_select_policy" ON public.contract_document_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY "contract_document_assignments_select_policy" ON public.contract_document_assignments FOR SELECT TO authenticated USING (true);

-- Nur Admins und Studioleiter können schreiben
CREATE POLICY "contracts_write_policy" ON public.contracts FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_terms_write_policy" ON public.contract_terms FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_pricing_write_policy" ON public.contract_pricing FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_starter_packages_write_policy" ON public.contract_starter_packages FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_flat_rates_write_policy" ON public.contract_flat_rates FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_modules_write_policy" ON public.contract_modules FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_module_assignments_write_policy" ON public.contract_module_assignments FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_documents_write_policy" ON public.contract_documents FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_document_sections_write_policy" ON public.contract_document_sections FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

CREATE POLICY "contract_document_assignments_write_policy" ON public.contract_document_assignments FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));

-- Nur Admins können Kategorien bearbeiten
CREATE POLICY "module_categories_write_policy" ON public.module_categories FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- KOMMENTARE
-- ============================================================================

COMMENT ON TABLE public.contracts IS 'Verträge mit Versionierung und Kampagnenlogik - V2 System';
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