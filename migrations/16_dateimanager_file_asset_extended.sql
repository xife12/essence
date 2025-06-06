-- Migration: Erweiterte Dateimanager-Berechtigungen
-- Erweitert die file_asset Tabelle um Sichtbarkeits- und Berechtigungsfelder

-- Neue ENUMs für erweiterte Berechtigungen
CREATE TYPE file_visibility AS ENUM (
    'public',      -- Für alle sichtbar
    'staff_only',  -- Nur für Mitarbeiter mit Upload-Berechtigung
    'admin_only'   -- Nur für Admins/Studioleiter
);

CREATE TYPE upload_permission AS ENUM (
    'none',        -- Keine Upload-Berechtigung
    'own_files',   -- Kann nur eigene Dateien verwalten
    'all_files'    -- Kann alle Dateien verwalten (Admin/Studioleiter)
);

-- Tabelle für Mitarbeiter-Upload-Berechtigungen
CREATE TABLE public.staff_file_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    upload_permission upload_permission DEFAULT 'none',
    can_see_admin_files BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(staff_id)
);

-- File_asset Tabelle erweitern
ALTER TABLE public.file_asset 
ADD COLUMN visibility file_visibility DEFAULT 'staff_only',
ADD COLUMN is_hidden_from_staff BOOLEAN DEFAULT false,
ADD COLUMN allowed_roles TEXT[] DEFAULT ARRAY['admin', 'studioleiter'];

-- Indizes für Performance
CREATE INDEX idx_file_asset_visibility ON public.file_asset(visibility);
CREATE INDEX idx_file_asset_hidden ON public.file_asset(is_hidden_from_staff);
CREATE INDEX idx_staff_file_permissions_staff_id ON public.staff_file_permissions(staff_id);

-- Updated_at Trigger für staff_file_permissions
CREATE TRIGGER update_staff_file_permissions_updated_at 
    BEFORE UPDATE ON public.staff_file_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS für staff_file_permissions
ALTER TABLE public.staff_file_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "staff_file_permissions_select" ON public.staff_file_permissions
    FOR SELECT TO authenticated
    USING (
        staff_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle IN ('admin', 'studioleiter')
        )
    );

CREATE POLICY "staff_file_permissions_admin_only" ON public.staff_file_permissions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle IN ('admin', 'studioleiter')
        )
    );

-- Erweiterte RLS Policies für file_asset (ersetzen die bestehenden)
DROP POLICY IF EXISTS "file_asset_select_policy" ON public.file_asset;
DROP POLICY IF EXISTS "file_asset_insert_policy" ON public.file_asset;
DROP POLICY IF EXISTS "file_asset_update_policy" ON public.file_asset;
DROP POLICY IF EXISTS "file_asset_delete_policy" ON public.file_asset;

-- Neue, erweiterte Policies
CREATE POLICY "file_asset_select_policy" ON public.file_asset
    FOR SELECT TO authenticated
    USING (
        -- Admins/Studioleiter sehen alles
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle IN ('admin', 'studioleiter')
        )
        OR
        -- Mitarbeiter sehen nur erlaubte Dateien
        (
            visibility = 'public' OR
            (
                visibility = 'staff_only' AND
                is_hidden_from_staff = false AND
                EXISTS (
                    SELECT 1 FROM public.staff_file_permissions sfp
                    JOIN public.staff s ON s.id = sfp.staff_id
                    WHERE sfp.staff_id = auth.uid() 
                    AND sfp.upload_permission != 'none'
                )
            ) OR
            (
                visibility = 'admin_only' AND
                EXISTS (
                    SELECT 1 FROM public.staff_file_permissions sfp
                    WHERE sfp.staff_id = auth.uid() 
                    AND sfp.can_see_admin_files = true
                )
            ) OR
            -- Eigene Dateien kann man immer sehen
            created_by = auth.uid()
        )
    );

CREATE POLICY "file_asset_insert_policy" ON public.file_asset
    FOR INSERT TO authenticated
    WITH CHECK (
        -- Nur Nutzer mit Upload-Berechtigung können hochladen
        EXISTS (
            SELECT 1 FROM public.staff_file_permissions sfp
            WHERE sfp.staff_id = auth.uid() 
            AND sfp.upload_permission != 'none'
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "file_asset_update_policy" ON public.file_asset
    FOR UPDATE TO authenticated
    USING (
        -- Admins/Studioleiter können alles bearbeiten
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle IN ('admin', 'studioleiter')
        )
        OR
        -- Mitarbeiter nur eigene Dateien (und nur Metadaten, nicht Sichtbarkeit)
        (
            created_by = auth.uid() AND
            EXISTS (
                SELECT 1 FROM public.staff_file_permissions sfp
                WHERE sfp.staff_id = auth.uid() 
                AND sfp.upload_permission != 'none'
            )
        )
    );

CREATE POLICY "file_asset_delete_policy" ON public.file_asset
    FOR DELETE TO authenticated
    USING (
        -- Nur Admins können löschen, oder Mitarbeiter ihre eigenen Dateien
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle = 'admin'
        )
        OR
        (
            created_by = auth.uid() AND
            EXISTS (
                SELECT 1 FROM public.staff_file_permissions sfp
                WHERE sfp.staff_id = auth.uid() 
                AND sfp.upload_permission != 'none'
            )
        )
    );

-- Storage Policies (für private Bucket)
-- Diese werden auf Storage-Ebene angewendet

-- Kommentare für neue Spalten
COMMENT ON COLUMN public.file_asset.visibility IS 'Sichtbarkeit: public, staff_only, admin_only';
COMMENT ON COLUMN public.file_asset.is_hidden_from_staff IS 'Vor normalen Mitarbeitern versteckt';
COMMENT ON COLUMN public.file_asset.allowed_roles IS 'Welche Rollen diese Datei sehen dürfen';

COMMENT ON TABLE public.staff_file_permissions IS 'Upload-Berechtigungen pro Mitarbeiter';
COMMENT ON COLUMN public.staff_file_permissions.upload_permission IS 'Upload-Berechtigung: none, own_files, all_files';
COMMENT ON COLUMN public.staff_file_permissions.can_see_admin_files IS 'Kann admin_only Dateien sehen';

-- Standard-Berechtigungen für bestehende Admins setzen
INSERT INTO public.staff_file_permissions (staff_id, upload_permission, can_see_admin_files)
SELECT s.id, 'all_files', true
FROM public.staff s 
WHERE s.rolle IN ('admin', 'studioleiter')
ON CONFLICT (staff_id) DO UPDATE SET
    upload_permission = 'all_files',
    can_see_admin_files = true; 