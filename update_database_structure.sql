-- SQL Query zur Aktualisierung der Datenbankstruktur (@00_datenbankstruktur.mdc)
-- Führe diese Query in Supabase SQL Editor aus, nachdem Migration 007 angewendet wurde

SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable,
    COALESCE(column_default, 'null') as column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('file_asset', 'staff_file_permissions', 'file_versions')
ORDER BY 
    table_schema,
    table_name,
    ordinal_position;

-- Diese Ausgabe in @00_datenbankstruktur.mdc ergänzen 