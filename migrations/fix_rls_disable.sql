-- Deaktiviere RLS für alle Vertragsarten-Tabellen (Entwicklungsumgebung)
-- Diese Änderung ist temporär für die Entwicklung

ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_terms DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_starter_packages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_flat_rates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_module_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_categories DISABLE ROW LEVEL SECURITY;

-- Entferne existierende RLS-Policies (falls vorhanden)
DROP POLICY IF EXISTS "contracts_select_policy" ON public.contracts;
DROP POLICY IF EXISTS "contracts_write_policy" ON public.contracts;
DROP POLICY IF EXISTS "contract_terms_select_policy" ON public.contract_terms;
DROP POLICY IF EXISTS "contract_terms_write_policy" ON public.contract_terms;
DROP POLICY IF EXISTS "contract_pricing_select_policy" ON public.contract_pricing;
DROP POLICY IF EXISTS "contract_pricing_write_policy" ON public.contract_pricing;
DROP POLICY IF EXISTS "contract_starter_packages_select_policy" ON public.contract_starter_packages;
DROP POLICY IF EXISTS "contract_starter_packages_write_policy" ON public.contract_starter_packages;
DROP POLICY IF EXISTS "contract_flat_rates_select_policy" ON public.contract_flat_rates;
DROP POLICY IF EXISTS "contract_flat_rates_write_policy" ON public.contract_flat_rates;
DROP POLICY IF EXISTS "contract_modules_select_policy" ON public.contract_modules;
DROP POLICY IF EXISTS "contract_modules_write_policy" ON public.contract_modules;
DROP POLICY IF EXISTS "contract_module_assignments_select_policy" ON public.contract_module_assignments;
DROP POLICY IF EXISTS "contract_module_assignments_write_policy" ON public.contract_module_assignments;
DROP POLICY IF EXISTS "module_categories_select_policy" ON public.module_categories;
DROP POLICY IF EXISTS "module_categories_write_policy" ON public.module_categories;

-- Bestätige Status
SELECT 'RLS Status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('contracts', 'contract_terms', 'contract_pricing', 'contract_starter_packages', 'contract_flat_rates', 'contract_module_assignments')
ORDER BY tablename; 