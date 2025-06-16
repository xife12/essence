-- Migration: Standard-Daten und Stored Procedures für Vertragsarten V2
-- Datum: 2024-12-01
-- Beschreibung: Standard-Kategorien, Stored Procedures und Views

-- ============================================================================
-- STANDARD MODUL-KATEGORIEN
-- ============================================================================

INSERT INTO public.module_categories (name, description, icon, color, sort_order) VALUES
('Training & Kurse', 'Gruppenkurse, Personaltraining, Workshops', 'Dumbbell', 'blue', 1),
('Wellness & Regeneration', 'Sauna, Massage, Entspannungsangebote', 'Waves', 'teal', 2),
('Gesundheit & Diagnostik', 'Gesundheitschecks, Körperanalyse', 'Heart', 'red', 3),
('Premium & Komfort', 'VIP-Bereiche, bevorzugte Behandlung', 'Crown', 'yellow', 4),
('Familie & Kinder', 'Kinderbetreuung, Familienkurse', 'Baby', 'pink', 5),
('Digital & App-Funktionen', 'Apps, Online-Content, Tracking', 'Smartphone', 'purple', 6),
('Community & Events', 'Veranstaltungen, Mitglieder-Events', 'Users', 'green', 7),
('Zugang & Infrastruktur', '24/7-Zugang, Parkplatz, Duschen', 'Building', 'gray', 8),
('Ernährung & Coaching', 'Ernährungsberatung, Lifestyle-Coaching', 'Apple', 'orange', 9)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- STORED PROCEDURES
-- ============================================================================

-- Stored Procedure für Bulk-Module-Assignment
CREATE OR REPLACE FUNCTION update_module_assignments(
    p_module_id UUID,
    p_assignments JSONB
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    assignment JSONB;
BEGIN
    -- Alle bestehenden Zuordnungen für dieses Modul löschen
    DELETE FROM public.contract_module_assignments 
    WHERE module_id = p_module_id;
    
    -- Neue Zuordnungen einfügen
    FOR assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
    LOOP
        IF (assignment->>'assignment_type') IS NOT NULL THEN
            INSERT INTO public.contract_module_assignments (
                module_id,
                contract_id,
                assignment_type,
                custom_price
            ) VALUES (
                p_module_id,
                (assignment->>'contract_id')::UUID,
                assignment->>'assignment_type',
                CASE 
                    WHEN assignment->>'custom_price' IS NOT NULL 
                    THEN (assignment->>'custom_price')::DECIMAL(10,2)
                    ELSE NULL
                END
            );
        END IF;
    END LOOP;
END;
$$;

-- Stored Procedure für Vertrag-Versionierung
CREATE OR REPLACE FUNCTION create_contract_version(
    p_base_contract_id UUID,
    p_version_note TEXT DEFAULT NULL,
    p_changes JSONB DEFAULT '{}'::JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_base_contract RECORD;
    v_new_version_number INTEGER;
    v_new_contract_id UUID;
    v_auto_note TEXT;
BEGIN
    -- Basis-Vertrag laden
    SELECT * INTO v_base_contract 
    FROM public.contracts 
    WHERE id = p_base_contract_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Vertrag mit ID % nicht gefunden', p_base_contract_id;
    END IF;
    
    -- Nächste Versionsnummer ermitteln
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO v_new_version_number
    FROM public.contracts 
    WHERE contract_group_id = v_base_contract.contract_group_id;
    
    -- Automatische Änderungsnotiz generieren
    v_auto_note := 'AUTO: Version ' || v_new_version_number || ' erstellt';
    
    -- Neue Version erstellen
    INSERT INTO public.contracts (
        contract_group_id,
        version_number,
        version_note,
        is_active,
        created_from_version_id,
        name,
        description,
        is_campaign_version,
        campaign_id,
        auto_renew,
        renewal_term_months,
        cancellation_period,
        cancellation_unit,
        group_discount_enabled,
        group_discount_type,
        group_discount_value,
        payment_runs,
        payment_methods,
        created_by
    ) VALUES (
        v_base_contract.contract_group_id,
        v_new_version_number,
        COALESCE(p_version_note, v_auto_note),
        true, -- Neue Version wird aktiviert
        p_base_contract_id,
        COALESCE((p_changes->>'name')::TEXT, v_base_contract.name),
        COALESCE((p_changes->>'description')::TEXT, v_base_contract.description),
        COALESCE((p_changes->>'is_campaign_version')::BOOLEAN, v_base_contract.is_campaign_version),
        COALESCE((p_changes->>'campaign_id')::UUID, v_base_contract.campaign_id),
        COALESCE((p_changes->>'auto_renew')::BOOLEAN, v_base_contract.auto_renew),
        COALESCE((p_changes->>'renewal_term_months')::INTEGER, v_base_contract.renewal_term_months),
        COALESCE((p_changes->>'cancellation_period')::INTEGER, v_base_contract.cancellation_period),
        COALESCE((p_changes->>'cancellation_unit')::TEXT, v_base_contract.cancellation_unit),
        COALESCE((p_changes->>'group_discount_enabled')::BOOLEAN, v_base_contract.group_discount_enabled),
        COALESCE((p_changes->>'group_discount_type')::TEXT, v_base_contract.group_discount_type),
        COALESCE((p_changes->>'group_discount_value')::DECIMAL(10,2), v_base_contract.group_discount_value),
        COALESCE((p_changes->>'payment_runs')::TEXT, v_base_contract.payment_runs),
        COALESCE((p_changes->>'payment_methods')::TEXT[], v_base_contract.payment_methods),
        auth.uid()
    ) RETURNING id INTO v_new_contract_id;
    
    -- Alte Version deaktivieren (nur wenn nicht Kampagnenversion)
    IF NOT COALESCE((p_changes->>'is_campaign_version')::BOOLEAN, false) THEN
        UPDATE public.contracts 
        SET is_active = false 
        WHERE contract_group_id = v_base_contract.contract_group_id 
        AND id != v_new_contract_id;
    END IF;
    
    -- Contract Terms kopieren (falls nicht in changes überschrieben)
    IF NOT (p_changes ? 'terms') THEN
        INSERT INTO public.contract_terms (contract_id, duration_months, base_price, sort_order)
        SELECT v_new_contract_id, duration_months, base_price, sort_order
        FROM public.contract_terms
        WHERE contract_id = p_base_contract_id;
    END IF;
    
    -- Module Assignments kopieren
    INSERT INTO public.contract_module_assignments (contract_id, module_id, assignment_type, custom_price, sort_order)
    SELECT v_new_contract_id, module_id, assignment_type, custom_price, sort_order
    FROM public.contract_module_assignments
    WHERE contract_id = p_base_contract_id;
    
    RETURN v_new_contract_id;
END;
$$;

-- Stored Procedure für Kampagnenvertrag-Erstellung
CREATE OR REPLACE FUNCTION create_campaign_contract(
    p_base_contract_id UUID,
    p_campaign_id UUID,
    p_modifications JSONB DEFAULT '{}'::JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_campaign_contract_id UUID;
    v_base_contract RECORD;
BEGIN
    -- Basis-Vertrag laden
    SELECT * INTO v_base_contract 
    FROM public.contracts 
    WHERE id = p_base_contract_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Basis-Vertrag mit ID % nicht gefunden', p_base_contract_id;
    END IF;
    
    -- Kampagnenvertrag als neue Version erstellen
    SELECT create_contract_version(
        p_base_contract_id,
        'KAMPAGNE: Kampagnenversion für Kampagne erstellt',
        jsonb_build_object(
            'is_campaign_version', true,
            'campaign_id', p_campaign_id,
            'base_version_id', p_base_contract_id,
            'auto_reactivate_version_id', p_base_contract_id,
            'is_active', false  -- Wird zeitgesteuert aktiviert
        ) || p_modifications
    ) INTO v_campaign_contract_id;
    
    RETURN v_campaign_contract_id;
END;
$$;

-- Function für automatische Änderungsnotizen
CREATE OR REPLACE FUNCTION generate_change_note(
    p_old_data JSONB,
    p_new_data JSONB
) RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_changes TEXT[] := ARRAY[]::TEXT[];
    v_result TEXT;
BEGIN
    -- Name geändert
    IF (p_old_data->>'name') != (p_new_data->>'name') THEN
        v_changes := array_append(v_changes, 
            format('Name: "%s" → "%s"', p_old_data->>'name', p_new_data->>'name'));
    END IF;
    
    -- Beschreibung geändert
    IF (p_old_data->>'description') != (p_new_data->>'description') THEN
        v_changes := array_append(v_changes, 'Beschreibung aktualisiert');
    END IF;
    
    -- Rabatte geändert
    IF (p_old_data->>'group_discount_enabled')::BOOLEAN != (p_new_data->>'group_discount_enabled')::BOOLEAN THEN
        IF (p_new_data->>'group_discount_enabled')::BOOLEAN THEN
            v_changes := array_append(v_changes, 'Gruppenrabatt aktiviert');
        ELSE
            v_changes := array_append(v_changes, 'Gruppenrabatt deaktiviert');
        END IF;
    END IF;
    
    -- Auto-Verlängerung geändert
    IF (p_old_data->>'auto_renew')::BOOLEAN != (p_new_data->>'auto_renew')::BOOLEAN THEN
        IF (p_new_data->>'auto_renew')::BOOLEAN THEN
            v_changes := array_append(v_changes, 'Auto-Verlängerung aktiviert');
        ELSE
            v_changes := array_append(v_changes, 'Auto-Verlängerung deaktiviert');
        END IF;
    END IF;
    
    IF array_length(v_changes, 1) > 0 THEN
        v_result := 'AUTO: ' || array_to_string(v_changes, ', ');
    ELSE
        v_result := 'AUTO: Konfiguration aktualisiert';
    END IF;
    
    RETURN v_result;
END;
$$;

-- Function für aktive Vertragsversionen pro Gruppe
CREATE OR REPLACE FUNCTION get_active_contract_version(p_contract_group_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_contract_id UUID;
BEGIN
    SELECT id INTO v_contract_id
    FROM public.contracts
    WHERE contract_group_id = p_contract_group_id
    AND is_active = true
    AND is_campaign_version = false
    ORDER BY version_number DESC
    LIMIT 1;
    
    RETURN v_contract_id;
END;
$$;

-- ============================================================================
-- VIEWS FÜR RÜCKWÄRTSKOMPATIBILITÄT
-- ============================================================================

-- View für alte contract_types Abfragen
CREATE OR REPLACE VIEW contract_types AS
SELECT 
    c.id,
    c.name,
    c.description,
    ct.duration_months as term,
    ct.base_price as price_per_month,
    0 as bonus_period, -- Wird über contract_pricing abgebildet
    c.auto_renew,
    c.renewal_term_months as renewal_term,
    c.group_discount_enabled as has_group_discount,
    c.group_discount_value as group_discount_rate,
    false as has_paid_modules, -- Wird über contract_module_assignments berechnet
    false as has_free_modules, -- Wird über contract_module_assignments berechnet  
    c.is_active as active,
    c.created_at,
    c.updated_at
FROM public.contracts c
LEFT JOIN public.contract_terms ct ON c.id = ct.contract_id
WHERE c.is_active = true
AND c.is_campaign_version = false;

-- View für erweiterte Vertragsinfo
CREATE OR REPLACE VIEW contracts_with_details AS
SELECT 
    c.*,
    -- Preise als JSON Array
    COALESCE(
        json_agg(
            json_build_object(
                'id', ct.id,
                'duration_months', ct.duration_months,
                'base_price', ct.base_price,
                'sort_order', ct.sort_order
            ) ORDER BY ct.sort_order
        ) FILTER (WHERE ct.id IS NOT NULL),
        '[]'::json
    ) as terms,
    
    -- Module Stats
    COUNT(cma_included.id) as modules_included_count,
    COUNT(cma_optional.id) as modules_optional_count,
    
    -- Preisdynamiken Count
    COUNT(cp.id) as pricing_rules_count
    
FROM public.contracts c
LEFT JOIN public.contract_terms ct ON c.id = ct.contract_id
LEFT JOIN public.contract_module_assignments cma_included ON c.id = cma_included.contract_id AND cma_included.assignment_type = 'included'
LEFT JOIN public.contract_module_assignments cma_optional ON c.id = cma_optional.contract_id AND cma_optional.assignment_type = 'optional'  
LEFT JOIN public.contract_pricing cp ON c.id = cp.contract_id AND cp.is_active = true
GROUP BY c.id;

-- View für Module mit Assignment-Statistiken
CREATE OR REPLACE VIEW modules_with_stats AS
SELECT 
    m.*,
    cat.name as category_name,
    cat.icon as category_icon,
    cat.color as category_color,
    COUNT(cma.id) as total_assignments,
    COUNT(cma.id) FILTER (WHERE cma.assignment_type = 'included') as included_count,
    COUNT(cma.id) FILTER (WHERE cma.assignment_type = 'optional') as optional_count
FROM public.contract_modules m
LEFT JOIN public.module_categories cat ON m.category_id = cat.id
LEFT JOIN public.contract_module_assignments cma ON m.id = cma.module_id
GROUP BY m.id, cat.name, cat.icon, cat.color;

-- ============================================================================
-- BEISPIEL-DATEN (optional für Development)
-- ============================================================================

-- Beispiel-Module einfügen (nur wenn noch keine vorhanden)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.contract_modules LIMIT 1) THEN
        
        -- Training & Kurse Module
        INSERT INTO public.contract_modules (name, description, price_per_month, category_id, icon_name) 
        SELECT 
            'Gruppenkurse',
            'Zugang zu allen Gruppenfitnesskursen (Yoga, Pilates, Zumba)',
            12.00,
            cat.id,
            'Dumbbell'
        FROM public.module_categories cat 
        WHERE cat.name = 'Training & Kurse';
        
        INSERT INTO public.contract_modules (name, description, price_per_month, category_id, icon_name)
        SELECT 
            'Personal Training',
            '1 Stunde Personal Training pro Woche',
            45.00,
            cat.id,
            'Target'
        FROM public.module_categories cat 
        WHERE cat.name = 'Training & Kurse';
        
        -- Wellness & Regeneration Module
        INSERT INTO public.contract_modules (name, description, price_per_month, category_id, icon_name)
        SELECT 
            'Sauna & Wellness',
            'Nutzung des Sauna- und Wellnessbereichs',
            18.00,
            cat.id,
            'Waves'
        FROM public.module_categories cat 
        WHERE cat.name = 'Wellness & Regeneration';
        
        INSERT INTO public.contract_modules (name, description, price_per_month, category_id, icon_name)
        SELECT 
            'Massage',
            'Monatliche Entspannungsmassage (30 min)',
            25.00,
            cat.id,
            'Coffee'
        FROM public.module_categories cat 
        WHERE cat.name = 'Wellness & Regeneration';
        
        -- Digital Module
        INSERT INTO public.contract_modules (name, description, price_per_month, category_id, icon_name)
        SELECT 
            'Fitness-App Premium',
            'Vollzugriff auf die Studio-App mit Trainingsvideos',
            8.00,
            cat.id,
            'Smartphone'
        FROM public.module_categories cat 
        WHERE cat.name = 'Digital & App-Funktionen';
        
        -- Premium Module
        INSERT INTO public.contract_modules (name, description, price_per_month, category_id, icon_name)
        SELECT 
            'VIP-Bereich',
            'Zugang zum exklusiven VIP-Trainingsbereich',
            35.00,
            cat.id,
            'Crown'
        FROM public.module_categories cat 
        WHERE cat.name = 'Premium & Komfort';
        
        RAISE NOTICE 'Beispiel-Module eingefügt';
    END IF;
END $$;

-- ============================================================================
-- PERMISSIONS FÜR STORED PROCEDURES
-- ============================================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION update_module_assignments(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_contract_version(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_campaign_contract(UUID, UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_change_note(JSONB, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_contract_version(UUID) TO authenticated;

-- Grant select on views
GRANT SELECT ON contract_types TO authenticated;
GRANT SELECT ON contracts_with_details TO authenticated;
GRANT SELECT ON modules_with_stats TO authenticated;