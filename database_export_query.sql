-- SQL Query zur Ausgabe aller Tabellen und Spalten für @00_datenbankstruktur.mdc
-- In Supabase SQL Editor ausführen

SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable,
    COALESCE(column_default, 'null') as column_default
FROM information_schema.columns
WHERE table_schema IN ('public', 'auth', 'storage', 'extensions', 'realtime', 'vault')
ORDER BY 
    table_schema,
    table_name,
    ordinal_position;

-- Optional: Formatiert als Markdown-Tabelle
-- (Kopiere das Ergebnis und ersetze es in @00_datenbankstruktur.mdc)

-- Alternative: Nur neue Tabellen seit der letzten Aktualisierung
SELECT 
    table_schema,
    table_name,
    column_name,
    data_type,
    is_nullable,
    COALESCE(column_default, 'null') as column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('file_asset', 'staff_file_permissions')
ORDER BY 
    table_schema,
    table_name,
    ordinal_position; 