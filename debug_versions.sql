-- =====================================================
-- Debug Queries für File Versions System
-- =====================================================
-- Diese Queries helfen dabei, den aktuellen Zustand zu überprüfen

-- 1. Überprüfe ob file_versions Tabelle existiert
-- =====================================================
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'file_versions'
ORDER BY ordinal_position;

-- 2. Überprüfe file_asset Tabelle Struktur
-- =====================================================
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'file_asset'
ORDER BY ordinal_position;

-- 3. Zeige alle file_asset Einträge
-- =====================================================
SELECT 
    id,
    filename,
    file_url,
    current_version_id,
    created_at
FROM public.file_asset
ORDER BY created_at DESC
LIMIT 10;

-- 4. Zeige alle file_versions Einträge (falls Tabelle existiert)
-- =====================================================
-- Auskommentiert, da Tabelle möglicherweise nicht existiert
-- SELECT 
--     id,
--     parent_file_id,
--     version_number,
--     filename,
--     created_at
-- FROM public.file_versions
-- ORDER BY parent_file_id, version_number;

-- 5. Überprüfe RLS Policies
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('file_asset', 'file_versions');

-- 6. Überprüfe ob campaigns Tabelle existiert (für die JOIN-Fehler)
-- =====================================================
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = 'campaigns'
) AS campaigns_table_exists;

-- 7. Zeige staff Tabelle für RLS (falls relevant)
-- =====================================================
SELECT 
    id,
    rolle,
    created_at
FROM public.staff
LIMIT 5; 