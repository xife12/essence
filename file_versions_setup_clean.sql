-- File Versions Setup: Sauberes Script für Dateiversionierung
-- Führe dieses Script in deinem Supabase SQL Editor aus

-- 1. file_versions Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.file_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_file_id UUID NOT NULL REFERENCES public.file_asset(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    version_description TEXT,
    changelog TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(parent_file_id, version_number)
);

-- 2. Funktion zum Ermitteln der nächsten Versionsnummer
CREATE OR REPLACE FUNCTION get_next_version_number(parent_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM file_versions
    WHERE parent_file_id = parent_id;
    
    RETURN next_version;
END;
$$;

-- 3. RLS aktivieren
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- 4. Policies erstellen (mit sicherer Prüfung)
-- SELECT Policy
DROP POLICY IF EXISTS "file_versions_select_policy" ON public.file_versions;
CREATE POLICY "file_versions_select_policy" ON public.file_versions
    FOR SELECT
    TO authenticated
    USING (true);

-- INSERT Policy  
DROP POLICY IF EXISTS "file_versions_insert_policy" ON public.file_versions;
CREATE POLICY "file_versions_insert_policy" ON public.file_versions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- UPDATE Policy
DROP POLICY IF EXISTS "file_versions_update_policy" ON public.file_versions;
CREATE POLICY "file_versions_update_policy" ON public.file_versions
    FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- DELETE Policy
DROP POLICY IF EXISTS "file_versions_delete_policy" ON public.file_versions;
CREATE POLICY "file_versions_delete_policy" ON public.file_versions
    FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- 5. Indices erstellen
CREATE INDEX IF NOT EXISTS idx_file_versions_parent_id ON public.file_versions(parent_file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_number ON public.file_versions(parent_file_id, version_number);

-- 6. Kommentare
COMMENT ON TABLE public.file_versions IS 'Versionierung von Dateien - speichert verschiedene Versionen einer Hauptdatei';
COMMENT ON COLUMN public.file_versions.version_number IS 'Laufende Nummer der Version, beginnt bei 1';
COMMENT ON COLUMN public.file_versions.version_description IS 'Kurze Beschreibung der Version';
COMMENT ON COLUMN public.file_versions.changelog IS 'Detaillierte Änderungsbeschreibung';

-- 7. Cleanup-Funktion
CREATE OR REPLACE FUNCTION cleanup_old_versions(parent_id UUID, keep_versions INTEGER DEFAULT 5)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    WITH old_versions AS (
        SELECT id
        FROM file_versions
        WHERE parent_file_id = parent_id
        ORDER BY version_number DESC
        OFFSET keep_versions
    )
    DELETE FROM file_versions
    WHERE id IN (SELECT id FROM old_versions);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- 8. Status ausgeben
SELECT 
    'file_versions' as tabelle,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'file_versions')
        THEN '✅ Existiert' 
        ELSE '❌ Nicht gefunden' 
    END as status,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'file_versions') as policies,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'file_versions') as indices; 