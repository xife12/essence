-- =====================================================
-- Migration: File Versions System (Manual Fix)
-- =====================================================
-- Diese Migration muss manuell im Supabase SQL Editor ausgeführt werden

-- 1. Erstelle die file_versions Tabelle
-- =====================================================
CREATE TABLE IF NOT EXISTS public.file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_file_id UUID NOT NULL REFERENCES public.file_asset(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Eindeutigkeit: pro parent_file_id kann jede version_number nur einmal vorkommen
    UNIQUE(parent_file_id, version_number)
);

-- 2. Erstelle Indizes für bessere Performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_file_versions_parent_file_id ON public.file_versions(parent_file_id);
CREATE INDEX IF NOT EXISTS idx_file_versions_version_number ON public.file_versions(version_number);
CREATE INDEX IF NOT EXISTS idx_file_versions_created_at ON public.file_versions(created_at);

-- 3. Erweitere file_asset Tabelle um current_version_id (falls nicht existiert)
-- =====================================================
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_asset' 
        AND column_name = 'current_version_id'
    ) THEN
        ALTER TABLE public.file_asset 
        ADD COLUMN current_version_id UUID REFERENCES public.file_versions(id);
    END IF;
END $$;

-- 4. Aktiviere Row Level Security (RLS)
-- =====================================================
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- 5. Erstelle RLS Policies
-- =====================================================
-- Policy: Alle können Versionen lesen (entspricht dem Zugriff auf file_asset)
CREATE POLICY "Allow read access for all authenticated users" ON public.file_versions
    FOR SELECT USING (auth.role() = 'authenticated');

-- Policy: Alle können neue Versionen erstellen
CREATE POLICY "Allow insert for authenticated users" ON public.file_versions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Nur Ersteller oder Admins können Versionen löschen
CREATE POLICY "Allow delete for creators or admins" ON public.file_versions
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE id = auth.uid() 
            AND rolle IN ('admin', 'studioleiter')
        )
    );

-- 6. Funktion: Nächste Versionsnummer ermitteln
-- =====================================================
-- Erst jetzt erstellen, nachdem die Tabelle existiert
CREATE OR REPLACE FUNCTION get_next_version_number(parent_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(version_number) + 1 FROM public.file_versions WHERE parent_file_id = parent_id),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Funktion: Aktuelle Version einer Datei ermitteln
-- =====================================================
CREATE OR REPLACE FUNCTION get_current_version(parent_id UUID)
RETURNS public.file_versions AS $$
DECLARE
    current_version public.file_versions;
BEGIN
    SELECT * INTO current_version
    FROM public.file_versions 
    WHERE parent_file_id = parent_id 
    ORDER BY version_number DESC 
    LIMIT 1;
    
    RETURN current_version;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger: Automatisch current_version_id setzen bei neuer Version
-- =====================================================
CREATE OR REPLACE FUNCTION update_current_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Setze die neue Version als aktuelle Version
    UPDATE public.file_asset 
    SET current_version_id = NEW.id
    WHERE id = NEW.parent_file_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Erstelle den Trigger
DROP TRIGGER IF EXISTS trigger_update_current_version ON public.file_versions;
CREATE TRIGGER trigger_update_current_version
    AFTER INSERT ON public.file_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_current_version();

-- 9. Erstelle initiale Versionen für existierende Dateien
-- =====================================================
-- Diese Funktion erstellt für jede existierende file_asset eine Version 1
DO $$
DECLARE
    asset_record RECORD;
BEGIN
    FOR asset_record IN 
        SELECT id, filename, file_url, created_by, created_at 
        FROM public.file_asset 
        WHERE current_version_id IS NULL
    LOOP
        -- Erstelle Version 1 für jede existierende Datei
        INSERT INTO public.file_versions (
            parent_file_id, 
            version_number, 
            filename, 
            file_url, 
            created_by, 
            created_at
        ) VALUES (
            asset_record.id,
            1,
            asset_record.filename,
            asset_record.file_url,
            asset_record.created_by,
            asset_record.created_at
        );
    END LOOP;
END $$;

-- =====================================================
-- Migration abgeschlossen!
-- =====================================================
-- Nach dieser Migration sollten folgende Funktionen verfügbar sein:
-- - file_versions Tabelle mit allen notwendigen Spalten
-- - RLS Policies für Sicherheit
-- - Automatische current_version_id Updates
-- - Initiale Versionen für alle existierenden Dateien
-- 
-- Teste mit: SELECT * FROM public.file_versions LIMIT 5;
-- ===================================================== 