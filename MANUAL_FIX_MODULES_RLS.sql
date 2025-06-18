-- 🔧 MANUELLE LÖSUNG: Module & RLS-Probleme beheben
-- Diese SQL-Datei muss MANUELL in Supabase SQL Editor ausgeführt werden

-- ==========================================
-- 1. RLS DEAKTIVIEREN (Entwicklungsumgebung)
-- ==========================================

-- Deaktiviere RLS für alle Vertragsarten-Tabellen
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_starter_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_flat_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_module_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_categories DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 2. CONTRACT_NUMBER SYSTEM HINZUFÜGEN
-- ==========================================

-- Füge contract_number Spalte hinzu (falls nicht vorhanden)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contract_number TEXT;

-- Füge campaign_version Spalte hinzu (für Kampagnen-Versionierung)
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS campaign_version INTEGER DEFAULT NULL;

-- Generiere Contract-Numbers für bestehende Verträge
UPDATE public.contracts 
SET contract_number = LPAD(FLOOR(RANDOM() * 90000 + 10000)::TEXT, 5, '0') || '-' || COALESCE(version_number, 1)::TEXT
WHERE contract_number IS NULL;

-- Erstelle Performance-Indizes
CREATE INDEX IF NOT EXISTS idx_contracts_contract_number ON public.contracts(contract_number);
CREATE INDEX IF NOT EXISTS idx_contracts_group_version ON public.contracts(contract_group_id, version_number);

-- ==========================================
-- 3. STARTER PACKAGE MODULE-ZUORDNUNGEN
-- ==========================================

-- Erstelle Tabelle für Starter-Package Module-Zuordnungen
CREATE TABLE IF NOT EXISTS public.contract_starter_package_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    starter_package_id UUID REFERENCES public.contract_starter_packages(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.contract_modules(id) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT true,
    custom_price DECIMAL(10,2) DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Verhindere Duplikate
    UNIQUE(starter_package_id, module_id)
);

-- Deaktiviere RLS auch für neue Tabelle
ALTER TABLE public.contract_starter_package_modules DISABLE ROW LEVEL SECURITY;

-- Erstelle Index für Performance
CREATE INDEX IF NOT EXISTS idx_starter_package_modules_package ON public.contract_starter_package_modules(starter_package_id);
CREATE INDEX IF NOT EXISTS idx_starter_package_modules_module ON public.contract_starter_package_modules(module_id);

-- ==========================================
-- 4. PAYMENT INTERVALS SYSTEM
-- ==========================================

-- Erstelle Tabelle für Contract Payment Intervals (falls nötig)
CREATE TABLE IF NOT EXISTS public.contract_payment_intervals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
    interval_type TEXT NOT NULL CHECK (interval_type IN ('monthly', 'semi_annual', 'yearly')),
    is_enabled BOOLEAN DEFAULT false,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Verhindere Duplikate
    UNIQUE(contract_id, interval_type)
);

-- Deaktiviere RLS
ALTER TABLE public.contract_payment_intervals DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. TEST-DATEN EINFÜGEN (zum Testen)
-- ==========================================

-- Füge Test-Module hinzu (falls keine vorhanden)
INSERT INTO public.contract_modules (id, name, description, category_id, price_per_month, price_type, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Gerätetraining', 'Zugang zu allen Fitnessgeräten', '11111111-1111-1111-1111-111111111111', 0.00, 'fixed', true),
    ('22222222-2222-2222-2222-222222222222', 'Kurse', 'Teilnahme an Gruppenkursen', '11111111-1111-1111-1111-111111111111', 15.00, 'per_month', true),
    ('33333333-3333-3333-3333-333333333333', 'Personal Training', 'Individuelle Betreuung', '11111111-1111-1111-1111-111111111111', 50.00, 'per_session', true)
ON CONFLICT (id) DO NOTHING;

-- Füge Test-Kategorie hinzu
INSERT INTO public.module_categories (id, name, description, sort_order, is_active)
VALUES ('11111111-1111-1111-1111-111111111111', 'Basis-Module', 'Grundlegende Fitness-Services', 1, true)
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 6. VALIDIERUNG & STATUS-CHECK
-- ==========================================

-- Überprüfe RLS-Status
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN '❌ RLS AKTIV' ELSE '✅ RLS DEAKTIVIERT' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'contracts', 
    'contract_terms', 
    'contract_pricing', 
    'contract_starter_packages', 
    'contract_flat_rates', 
    'contract_module_assignments',
    'contract_starter_package_modules',
    'contract_payment_intervals'
)
ORDER BY tablename;

-- Überprüfe Contract-Numbers
SELECT 
    COUNT(*) as total_contracts,
    COUNT(contract_number) as contracts_with_numbers,
    COUNT(*) - COUNT(contract_number) as contracts_missing_numbers
FROM public.contracts;

-- Zeige Beispiel-Contract-Numbers
SELECT id, name, contract_number, version_number, campaign_version 
FROM public.contracts 
ORDER BY created_at DESC 
LIMIT 5;

-- ==========================================
-- ERFOLGSMELDUNG
-- ==========================================

-- Hinweis für Benutzer
SELECT '🎯 Module-Fix erfolgreich abgeschlossen!' as status,
       '✅ RLS deaktiviert' as rls_status,
       '✅ Contract-Numbers generiert' as numbering_status,
       '✅ Starter-Package-Module-Tabelle erstellt' as packages_status,
       '✅ Payment-Intervals-Tabelle erstellt' as intervals_status;

-- NÄCHSTE SCHRITTE:
-- 1. API-Server neu starten: npm run dev
-- 2. Test mit echtem Vertrag durchführen
-- 3. Module-Speicherung sollte jetzt funktionieren 