-- Migration 007: Dokumentenversionierung
-- Tabelle für Dateiversionen

-- 1. ZUERST: Tabelle erstellen
CREATE TABLE IF NOT EXISTS public.file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Verknüpfung zur Hauptdatei (file_asset)
    parent_file_id UUID NOT NULL REFERENCES public.file_asset(id) ON DELETE CASCADE,
    
    -- Versionsinformationen
    version_number INTEGER NOT NULL DEFAULT 1,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    
    -- Versionsbeschreibung und Änderungen
    version_description TEXT,
    changelog TEXT, -- Was wurde geändert?
    
    -- Metadaten werden von parent_file_id übernommen
    -- Nur individuelle Felder pro Version:
    is_current_version BOOLEAN DEFAULT false,
    
    -- Audit-Felder
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(parent_file_id, version_number)
);

-- 2. DANN: Indexes erstellen
CREATE INDEX IF NOT EXISTS idx_file_versions_parent_file_id 
ON public.file_versions(parent_file_id);

CREATE INDEX IF NOT EXISTS idx_file_versions_current 
ON public.file_versions(parent_file_id, is_current_version) 
WHERE is_current_version = true;

-- 3. RLS aktivieren (vorerst ohne Policies für Tests)
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- Für Tests: RLS temporär deaktivieren
ALTER TABLE public.file_versions DISABLE ROW LEVEL SECURITY;

-- 4. DANACH: Funktionen erstellen (jetzt existiert die Tabelle bereits)

-- Hilfsfunktion: Nächste Versionsnummer ermitteln
CREATE OR REPLACE FUNCTION get_next_version_number(file_id UUID)
RETURNS INTEGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    SELECT COALESCE(MAX(version_number), 0) + 1 
    INTO next_version 
    FROM public.file_versions 
    WHERE parent_file_id = file_id;
    
    RETURN next_version;
END;
$$ LANGUAGE plpgsql;

-- Trigger-Funktion: Nur eine Version pro parent_file_id kann current sein
CREATE OR REPLACE FUNCTION ensure_single_current_version()
RETURNS TRIGGER AS $$
BEGIN
    -- Falls neue Version als current markiert wird
    IF NEW.is_current_version = true THEN
        -- Alle anderen Versionen der gleichen Datei auf false setzen
        UPDATE public.file_versions 
        SET is_current_version = false 
        WHERE parent_file_id = NEW.parent_file_id 
        AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. ZULETZT: Trigger erstellen
CREATE TRIGGER trigger_ensure_single_current_version
    BEFORE INSERT OR UPDATE ON public.file_versions
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_current_version();

-- Kommentare für Dokumentation
COMMENT ON TABLE public.file_versions IS 'Versionsverwaltung für Dateien - alle Versionen teilen sich die Metadaten der Hauptdatei (file_asset)';
COMMENT ON COLUMN public.file_versions.parent_file_id IS 'Referenz zur Hauptdatei in file_asset - Metadaten werden von dort übernommen';
COMMENT ON COLUMN public.file_versions.version_number IS 'Versionsnummer, beginnt bei 1 (älteste Version)';
COMMENT ON COLUMN public.file_versions.is_current_version IS 'Nur eine Version pro Datei kann die aktuelle sein';

-- Info: Migration erfolgreich
SELECT 'Migration 007: file_versions Tabelle erstellt' as status; 