-- =====================================================
-- SCHRITT-FÜR-SCHRITT MIGRATION ZUM DEBUGGING
-- =====================================================
-- Führe jeden Schritt einzeln aus und prüfe das Ergebnis

-- SCHRITT 1: Prüfe ob file_asset Tabelle existiert
-- =====================================================
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'file_asset'
ORDER BY ordinal_position;

-- SCHRITT 2: Lösche file_versions Tabelle falls sie existiert (für sauberen Start)
-- =====================================================
DROP TABLE IF EXISTS public.file_versions CASCADE;

-- SCHRITT 3: Entferne current_version_id Spalte falls sie existiert
-- =====================================================
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'file_asset' 
        AND column_name = 'current_version_id'
    ) THEN
        ALTER TABLE public.file_asset DROP COLUMN current_version_id;
    END IF;
END $$;

-- SCHRITT 4: Erstelle file_versions Tabelle (ohne Foreign Key zunächst)
-- =====================================================
CREATE TABLE public.file_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_file_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    mime_type TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Eindeutigkeit: pro parent_file_id kann jede version_number nur einmal vorkommen
    UNIQUE(parent_file_id, version_number)
);

-- SCHRITT 5: Prüfe ob file_versions Tabelle erstellt wurde
-- =====================================================
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'file_versions'
ORDER BY ordinal_position;

-- SCHRITT 6: Füge Foreign Key Constraints hinzu
-- =====================================================
ALTER TABLE public.file_versions 
ADD CONSTRAINT fk_file_versions_parent 
FOREIGN KEY (parent_file_id) REFERENCES public.file_asset(id) ON DELETE CASCADE;

ALTER TABLE public.file_versions 
ADD CONSTRAINT fk_file_versions_created_by 
FOREIGN KEY (created_by) REFERENCES auth.users(id);

-- SCHRITT 7: Erstelle Indizes
-- =====================================================
CREATE INDEX idx_file_versions_parent_file_id ON public.file_versions(parent_file_id);
CREATE INDEX idx_file_versions_version_number ON public.file_versions(version_number);
CREATE INDEX idx_file_versions_created_at ON public.file_versions(created_at);

-- SCHRITT 8: Füge current_version_id zu file_asset hinzu
-- =====================================================
ALTER TABLE public.file_asset 
ADD COLUMN current_version_id UUID;

-- Erst später den Foreign Key hinzufügen (nach dem wir Daten haben)

-- SCHRITT 9: Aktiviere RLS
-- =====================================================
ALTER TABLE public.file_versions ENABLE ROW LEVEL SECURITY;

-- SCHRITT 10: Erstelle RLS Policies
-- =====================================================
CREATE POLICY "file_versions_select_policy" ON public.file_versions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "file_versions_insert_policy" ON public.file_versions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "file_versions_delete_policy" ON public.file_versions
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE id = auth.uid() 
            AND rolle IN ('admin', 'studioleiter')
        )
    );

-- SCHRITT 11: Erstelle Funktionen (jetzt wo die Tabelle sicher existiert)
-- =====================================================
CREATE OR REPLACE FUNCTION get_next_version_number(parent_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN COALESCE(
        (SELECT MAX(version_number) + 1 FROM public.file_versions WHERE parent_file_id = parent_id),
        1
    );
END;
$$ LANGUAGE plpgsql;

-- SCHRITT 12: Teste die Funktion
-- =====================================================
SELECT get_next_version_number('00000000-0000-0000-0000-000000000000'::uuid) as test_result;

-- SCHRITT 13: Erstelle initiale Versionen für existierende Dateien
-- =====================================================
DO $$
DECLARE
    asset_record RECORD;
    inserted_version_id UUID;
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
        ) RETURNING id INTO inserted_version_id;
        
        -- Setze diese Version als aktuelle Version
        UPDATE public.file_asset 
        SET current_version_id = inserted_version_id
        WHERE id = asset_record.id;
    END LOOP;
END $$;

-- SCHRITT 14: Füge jetzt den Foreign Key für current_version_id hinzu
-- =====================================================
ALTER TABLE public.file_asset 
ADD CONSTRAINT fk_file_asset_current_version 
FOREIGN KEY (current_version_id) REFERENCES public.file_versions(id);

-- SCHRITT 15: Erstelle Trigger für zukünftige Versionen
-- =====================================================
CREATE OR REPLACE FUNCTION update_current_version()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.file_asset 
    SET current_version_id = NEW.id
    WHERE id = NEW.parent_file_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_current_version ON public.file_versions;
CREATE TRIGGER trigger_update_current_version
    AFTER INSERT ON public.file_versions
    FOR EACH ROW
    EXECUTE FUNCTION update_current_version();

-- SCHRITT 16: Finale Überprüfung
-- =====================================================
SELECT 
    'file_versions' as table_name,
    COUNT(*) as row_count
FROM public.file_versions
UNION ALL
SELECT 
    'file_asset mit current_version_id' as table_name,
    COUNT(*) as row_count
FROM public.file_asset 
WHERE current_version_id IS NOT NULL; 