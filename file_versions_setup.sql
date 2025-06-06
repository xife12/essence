-- File Versions Setup: Sicheres Update-Script für Dateiversionierung
-- Führe dieses Script in deinem Supabase SQL Editor aus
-- Berücksichtigt bereits vorhandene Strukturen

-- 1. file_versions Tabelle erstellen (falls nicht vorhanden)
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
    
    -- Constraint: Ein parent_file_id kann nicht dieselbe version_number zweimal haben
    UNIQUE(parent_file_id, version_number)
);

-- 2. Funktion zum Ermitteln der nächsten Versionsnummer (immer neu erstellen)
CREATE OR REPLACE FUNCTION get_next_version_number(parent_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    next_version INTEGER;
BEGIN
    -- Hole die höchste Versionsnummer für diese Datei
    SELECT COALESCE(MAX(version_number), 0) + 1
    INTO next_version
    FROM file_versions
    WHERE parent_file_id = parent_id;
    
    RETURN next_version;
END;
$$;

-- 3. RLS (Row Level Security) aktivieren (nur wenn nicht schon aktiviert)
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- 4. Policies für file_versions erstellen (nur falls nicht vorhanden)
DO $$
BEGIN
    -- Policy: Alle authentifizierten Benutzer können Versionen lesen
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'file_versions' AND policyname = 'file_versions_select_policy'
    ) THEN
        CREATE POLICY "file_versions_select_policy" ON public.file_versions
            FOR SELECT
            TO authenticated
            USING (true);
        RAISE NOTICE 'Policy file_versions_select_policy erstellt';
    ELSE
        RAISE NOTICE 'Policy file_versions_select_policy existiert bereits';
    END IF;

    -- Policy: Alle authentifizierten Benutzer können Versionen erstellen
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'file_versions' AND policyname = 'file_versions_insert_policy'
    ) THEN
        CREATE POLICY "file_versions_insert_policy" ON public.file_versions
            FOR INSERT
            TO authenticated
            WITH CHECK (true);
        RAISE NOTICE 'Policy file_versions_insert_policy erstellt';
    ELSE
        RAISE NOTICE 'Policy file_versions_insert_policy existiert bereits';
    END IF;

    -- Policy: Nur der Ersteller kann Versionen aktualisieren
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'file_versions' AND policyname = 'file_versions_update_policy'
    ) THEN
        CREATE POLICY "file_versions_update_policy" ON public.file_versions
            FOR UPDATE
            TO authenticated
            USING (created_by = auth.uid());
        RAISE NOTICE 'Policy file_versions_update_policy erstellt';
    ELSE
        RAISE NOTICE 'Policy file_versions_update_policy existiert bereits';
    END IF;

    -- Policy: Nur der Ersteller kann Versionen löschen
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'file_versions' AND policyname = 'file_versions_delete_policy'
    ) THEN
        CREATE POLICY "file_versions_delete_policy" ON public.file_versions
            FOR DELETE
            TO authenticated
            USING (created_by = auth.uid());
        RAISE NOTICE 'Policy file_versions_delete_policy erstellt';
    ELSE
        RAISE NOTICE 'Policy file_versions_delete_policy existiert bereits';
    END IF;
END $$;

-- 5. Trigger für automatische Timestamps (immer neu erstellen)
CREATE OR REPLACE FUNCTION update_file_versions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Index für bessere Performance (nur falls nicht vorhanden)
CREATE INDEX IF NOT EXISTS idx_file_versions_parent_id ON public.file_versions(parent_file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_number ON public.file_versions(parent_file_id, version_number);

-- 7. Kommentare für Dokumentation (immer setzen)
COMMENT ON TABLE public.file_versions IS 'Versionierung von Dateien - speichert verschiedene Versionen einer Hauptdatei';
COMMENT ON COLUMN public.file_versions.version_number IS 'Laufende Nummer der Version, beginnt bei 1';
COMMENT ON COLUMN public.file_versions.version_description IS 'Kurze Beschreibung der Version (z.B. "Korrigierte Schriftart")';
COMMENT ON COLUMN public.file_versions.changelog IS 'Detaillierte Änderungsbeschreibung';

-- 8. current_version_id Spalte prüfen (laut Datenbankstruktur bereits vorhanden)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_asset' AND column_name = 'current_version_id'
    ) THEN
        ALTER TABLE public.file_asset ADD COLUMN current_version_id UUID REFERENCES public.file_versions(id);
        RAISE NOTICE 'Spalte current_version_id zu file_asset hinzugefügt';
    ELSE
        RAISE NOTICE 'Spalte current_version_id existiert bereits (wie erwartet)';
    END IF;
END $$;

-- 9. Optional: Beispiel-Funktion zum Bereinigen alter Versionen (immer neu erstellen)
CREATE OR REPLACE FUNCTION cleanup_old_versions(parent_id UUID, keep_versions INTEGER DEFAULT 5)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Lösche alte Versionen, behalte nur die neuesten N
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

-- 10. Prüfe Tabellenstatus
DO $$
DECLARE
    table_exists BOOLEAN;
    policy_count INTEGER;
    index_count INTEGER;
BEGIN
    -- Prüfe ob Tabelle existiert
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'file_versions'
    ) INTO table_exists;
    
    -- Zähle Policies
    SELECT COUNT(*) FROM pg_policies 
    WHERE tablename = 'file_versions' INTO policy_count;
    
    -- Zähle Indices
    SELECT COUNT(*) FROM pg_indexes 
    WHERE tablename = 'file_versions' INTO index_count;
    
    RAISE NOTICE '====================================';
    RAISE NOTICE 'File Versions Setup-Status:';
    RAISE NOTICE 'Tabelle file_versions existiert: %', table_exists;
    RAISE NOTICE 'Anzahl Policies: %', policy_count;
    RAISE NOTICE 'Anzahl Indices: %', index_count;
    RAISE NOTICE '====================================';
    
    IF table_exists THEN
        RAISE NOTICE '✅ Das Versionierungssystem ist bereit!';
        RAISE NOTICE 'Du kannst jetzt Dateiversionen über die uploadNewVersion() API-Funktion erstellen.';
    ELSE
        RAISE EXCEPTION 'Fehler: file_versions Tabelle konnte nicht erstellt werden!';
    END IF;
END $$; 