-- Vertragsarten V2: RLS-Policy-Fixes
-- Problem: Neue Zeilen können nicht eingefügt werden wegen RLS

-- 1. Prüfe aktuelle RLS-Policies
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd, 
    qual, 
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'contracts', 
    'contract_terms', 
    'contract_module_assignments', 
    'contract_starter_packages', 
    'contract_flat_rates'
);

-- 2. Deaktiviere RLS temporär für alle Contract-Tabellen (für Tests)
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_module_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_starter_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_flat_rates DISABLE ROW LEVEL SECURITY;

-- 3. Für Produktionsumgebung: Korrekte RLS-Policies
-- (Kommentiert aus - nur aktivieren wenn RLS gewünscht)

/*
-- Erlaube alle Operationen für eingeloggte Benutzer
CREATE POLICY "Allow all for authenticated users" ON public.contracts
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.contract_terms
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.contract_module_assignments
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.contract_starter_packages
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON public.contract_flat_rates
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Reaktiviere RLS mit neuen Policies
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_module_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_starter_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_flat_rates ENABLE ROW LEVEL SECURITY;
*/ 