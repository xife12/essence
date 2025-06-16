-- Fehlende Tabellen für Vertragsarten V2 System
-- Basiert auf der Aufgabenliste des Background Agents

-- 1. Contract Pricing - Preisdynamiken (Stichtag, wiederholend)
CREATE TABLE IF NOT EXISTS public.contract_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    pricing_type TEXT NOT NULL CHECK (pricing_type IN ('einmalig', 'stichtag', 'wiederholend')),
    
    -- Stichtag-spezifisch
    trigger_type TEXT CHECK (trigger_type IN ('monthly_first', 'manual_date')),
    trigger_date DATE,
    trigger_day INTEGER CHECK (trigger_day BETWEEN 1 AND 31),
    
    -- Wiederholend-spezifisch
    repeat_interval TEXT CHECK (repeat_interval IN ('monthly', 'yearly')),
    repeat_after_months INTEGER,
    
    -- Preisanpassung
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('fixed_amount', 'percentage')),
    adjustment_value DECIMAL(10,2) NOT NULL,
    
    -- Gültigkeit
    valid_from DATE,
    valid_until DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Contract Starter Packages - Startpakete für Verträge
CREATE TABLE IF NOT EXISTS public.contract_starter_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Contract Flat Rates - Pauschalen pro Vertrag
CREATE TABLE IF NOT EXISTS public.contract_flat_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    billing_type TEXT NOT NULL CHECK (billing_type IN ('monthly', 'yearly', 'once')),
    is_mandatory BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Contract Documents - WYSIWYG-Vertragsdokumente mit Versionierung
CREATE TABLE IF NOT EXISTS public.contract_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Versionierung
    document_group_id UUID DEFAULT gen_random_uuid(),
    version_number INTEGER DEFAULT 1,
    version_note TEXT,
    is_active BOOLEAN DEFAULT true,
    created_from_version_id UUID,
    
    -- Anzeige-Optionen
    show_payment_calendar BOOLEAN DEFAULT false,
    show_service_content BOOLEAN DEFAULT false,
    show_member_data BOOLEAN DEFAULT false,
    
    -- Template-Einstellungen
    header_template TEXT,
    footer_template TEXT,
    css_styles TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    FOREIGN KEY (created_from_version_id) REFERENCES contract_documents(id) ON DELETE SET NULL
);

-- 5. Contract Document Sections - Abschnitte der Vertragsdokumente
CREATE TABLE IF NOT EXISTS public.contract_document_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID NOT NULL REFERENCES contract_documents(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    
    -- Abschnitts-Eigenschaften
    is_mandatory BOOLEAN DEFAULT false,
    requires_signature BOOLEAN DEFAULT false,
    display_as_checkbox BOOLEAN DEFAULT false,
    
    -- Bedingte Anzeige
    show_condition JSONB,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Contract Document Assignments - Zuordnung Dokumente zu Verträgen
CREATE TABLE IF NOT EXISTS public.contract_document_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES contract_documents(id) ON DELETE CASCADE,
    override_settings JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(contract_id, document_id)
);

-- Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_contract_pricing_contract_id ON contract_pricing(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_pricing_pricing_type ON contract_pricing(pricing_type);
CREATE INDEX IF NOT EXISTS idx_contract_pricing_is_active ON contract_pricing(is_active);

CREATE INDEX IF NOT EXISTS idx_contract_starter_packages_contract_id ON contract_starter_packages(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_starter_packages_sort_order ON contract_starter_packages(sort_order);

CREATE INDEX IF NOT EXISTS idx_contract_flat_rates_contract_id ON contract_flat_rates(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_flat_rates_billing_type ON contract_flat_rates(billing_type);

CREATE INDEX IF NOT EXISTS idx_contract_documents_document_group_id ON contract_documents(document_group_id);
CREATE INDEX IF NOT EXISTS idx_contract_documents_is_active ON contract_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_contract_documents_version_number ON contract_documents(version_number);

CREATE INDEX IF NOT EXISTS idx_contract_document_sections_document_id ON contract_document_sections(document_id);
CREATE INDEX IF NOT EXISTS idx_contract_document_sections_sort_order ON contract_document_sections(sort_order);

CREATE INDEX IF NOT EXISTS idx_contract_document_assignments_contract_id ON contract_document_assignments(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_document_assignments_document_id ON contract_document_assignments(document_id);

-- Volltext-Suche Indizes (gin)
CREATE INDEX IF NOT EXISTS idx_contract_documents_name_fulltext ON contract_documents USING gin(to_tsvector('german', name));
CREATE INDEX IF NOT EXISTS idx_contract_documents_description_fulltext ON contract_documents USING gin(to_tsvector('german', description));

-- Updated At Trigger für alle neuen Tabellen
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger für contract_pricing
CREATE TRIGGER set_contract_pricing_updated_at
    BEFORE UPDATE ON contract_pricing
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Trigger für contract_starter_packages  
CREATE TRIGGER set_contract_starter_packages_updated_at
    BEFORE UPDATE ON contract_starter_packages
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Trigger für contract_flat_rates
CREATE TRIGGER set_contract_flat_rates_updated_at
    BEFORE UPDATE ON contract_flat_rates
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Trigger für contract_documents
CREATE TRIGGER set_contract_documents_updated_at
    BEFORE UPDATE ON contract_documents
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) Policies aktivieren
ALTER TABLE contract_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_starter_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_flat_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_document_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_document_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies für authenticated users (read)
CREATE POLICY "Enable read access for authenticated users" ON contract_pricing
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON contract_starter_packages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON contract_flat_rates
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON contract_documents
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON contract_document_sections
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON contract_document_assignments
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies für admin/studioleiter (write)
CREATE POLICY "Enable write access for admin/studioleiter" ON contract_pricing
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for admin/studioleiter" ON contract_starter_packages
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for admin/studioleiter" ON contract_flat_rates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for admin/studioleiter" ON contract_documents
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for admin/studioleiter" ON contract_document_sections
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for admin/studioleiter" ON contract_document_assignments
    FOR ALL USING (auth.role() = 'authenticated');

-- Database Views
CREATE OR REPLACE VIEW contracts_with_details AS
SELECT 
    c.*,
    COUNT(DISTINCT ct.id) as terms_count,
    COUNT(DISTINCT cma.id) as modules_count,
    COUNT(DISTINCT cda.id) as documents_count,
    AVG(ct.base_price) as avg_base_price,
    COUNT(DISTINCT CASE WHEN cma.assignment_type = 'included' THEN cma.id END) as modules_included_count,
    COUNT(DISTINCT CASE WHEN cma.assignment_type = 'optional' THEN cma.id END) as modules_optional_count,
    COUNT(DISTINCT cp.id) as pricing_rules_count
FROM contracts c
LEFT JOIN contract_terms ct ON c.id = ct.contract_id
LEFT JOIN contract_module_assignments cma ON c.id = cma.contract_id
LEFT JOIN contract_document_assignments cda ON c.id = cda.contract_id
LEFT JOIN contract_pricing cp ON c.id = cp.contract_id AND cp.is_active = true
GROUP BY c.id;

CREATE OR REPLACE VIEW modules_with_stats AS
SELECT 
    cm.*,
    mc.name as category_name,
    mc.icon as category_icon,
    mc.color as category_color,
    COUNT(DISTINCT cma.id) as total_assignments,
    COUNT(DISTINCT CASE WHEN cma.assignment_type = 'included' THEN cma.id END) as included_count,
    COUNT(DISTINCT CASE WHEN cma.assignment_type = 'optional' THEN cma.id END) as optional_count
FROM contract_modules cm
LEFT JOIN module_categories mc ON cm.category_id = mc.id
LEFT JOIN contract_module_assignments cma ON cm.id = cma.module_id
GROUP BY cm.id, mc.name, mc.icon, mc.color;

-- Stored Procedures
CREATE OR REPLACE FUNCTION create_contract_version(
    base_contract_id UUID,
    version_note TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    new_contract_id UUID;
    current_version INTEGER;
BEGIN
    -- Aktuelle Version ermitteln
    SELECT MAX(version_number) INTO current_version
    FROM contracts 
    WHERE contract_group_id = (SELECT contract_group_id FROM contracts WHERE id = base_contract_id);
    
    -- Neue Version erstellen
    INSERT INTO contracts (
        contract_group_id,
        version_number,
        version_note,
        created_from_version_id,
        name,
        description,
        auto_renew,
        renewal_term_months,
        cancellation_period,
        cancellation_unit,
        group_discount_enabled,
        group_discount_type,
        group_discount_value,
        is_campaign_version,
        campaign_id,
        is_active
    )
    SELECT 
        contract_group_id,
        current_version + 1,
        version_note,
        base_contract_id,
        name || ' (v' || (current_version + 1) || ')',
        description,
        auto_renew,
        renewal_term_months,
        cancellation_period,
        cancellation_unit,
        group_discount_enabled,
        group_discount_type,
        group_discount_value,
        false, -- Neue Version ist keine Kampagnen-Version
        NULL,
        true
    FROM contracts 
    WHERE id = base_contract_id
    RETURNING id INTO new_contract_id;
    
    -- Terms kopieren
    INSERT INTO contract_terms (contract_id, duration_months, base_price, sort_order)
    SELECT new_contract_id, duration_months, base_price, sort_order
    FROM contract_terms
    WHERE contract_id = base_contract_id;
    
    -- Module-Assignments kopieren
    INSERT INTO contract_module_assignments (contract_id, module_id, assignment_type, custom_price, sort_order)
    SELECT new_contract_id, module_id, assignment_type, custom_price, sort_order
    FROM contract_module_assignments
    WHERE contract_id = base_contract_id;
    
    RETURN new_contract_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_active_contract_version(contract_group_id UUID)
RETURNS UUID AS $$
DECLARE
    active_contract_id UUID;
BEGIN
    SELECT id INTO active_contract_id
    FROM contracts
    WHERE contract_group_id = get_active_contract_version.contract_group_id
    AND is_active = true
    ORDER BY version_number DESC
    LIMIT 1;
    
    RETURN active_contract_id;
END;
$$ LANGUAGE plpgsql;

-- Testdaten für die neuen Tabellen
INSERT INTO contract_documents (name, description, show_payment_calendar, show_service_content, show_member_data, header_template, footer_template) VALUES
('Standard-Mitgliedsvertrag', 'Allgemeiner Vertrag für Mitgliedschaften', true, true, true, 
 '<div class="header"><h1>{{studio.name}}</h1><p>{{studio.address}}</p></div>',
 '<div class="footer"><p>Seite {{page}} von {{total_pages}}</p></div>');

-- Dokumentabschnitte
INSERT INTO contract_document_sections (document_id, title, content, sort_order, is_mandatory, requires_signature) VALUES
((SELECT id FROM contract_documents WHERE name = 'Standard-Mitgliedsvertrag'), 
 'Vertragspartner', 'Zwischen {{member.name}} und {{studio.name}} wird folgender Vertrag geschlossen:', 0, true, false),
((SELECT id FROM contract_documents WHERE name = 'Standard-Mitgliedsvertrag'), 
 'Leistungsumfang', 'Der Mitgliedschaft umfasst: {{contract.modules}}', 1, true, false),
((SELECT id FROM contract_documents WHERE name = 'Standard-Mitgliedsvertrag'), 
 'Unterschrift', 'Hiermit bestätige ich die Richtigkeit der Angaben.', 2, true, true);

COMMENT ON TABLE contract_pricing IS 'Preisdynamiken für Verträge (einmalig, Stichtag, wiederholend)';
COMMENT ON TABLE contract_starter_packages IS 'Startpakete die zu Verträgen gehören';
COMMENT ON TABLE contract_flat_rates IS 'Pauschalen pro Vertrag (monatlich, jährlich, einmalig)';
COMMENT ON TABLE contract_documents IS 'WYSIWYG-Vertragsdokumente mit Versionierung';
COMMENT ON TABLE contract_document_sections IS 'Abschnitte der Vertragsdokumente';
COMMENT ON TABLE contract_document_assignments IS 'Zuordnung von Dokumenten zu Verträgen'; 