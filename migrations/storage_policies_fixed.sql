-- Storage Policies für privaten file-assets Bucket (KORRIGIERT)
-- Diese müssen in Supabase nach der Bucket-Erstellung ausgeführt werden

-- Bucket als PRIVATE erstellen (nicht public!)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('file-assets', 'file-assets', false);

-- Zuerst alle bestehenden Policies löschen (falls vorhanden)
DROP POLICY IF EXISTS "authenticated_upload_with_permission" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_download_with_permission" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_or_admin" ON storage.objects;

-- Upload Policy: Nur Mitarbeiter mit Upload-Berechtigung
CREATE POLICY "authenticated_upload_with_permission" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'file-assets' AND
    EXISTS (
        SELECT 1 FROM public.staff_file_permissions sfp
        WHERE sfp.staff_id = auth.uid() 
        AND sfp.upload_permission != 'none'
    )
);

-- Download Policy: Basierend auf file_asset Berechtigungen
CREATE POLICY "authenticated_download_with_permission" ON storage.objects
FOR SELECT TO authenticated
USING (
    bucket_id = 'file-assets' AND
    (
        -- Admins/Studioleiter können alles herunterladen
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle IN ('admin', 'studioleiter')
        )
        OR
        -- Mitarbeiter nur erlaubte Dateien
        EXISTS (
            SELECT 1 FROM public.file_asset fa
            WHERE fa.file_url LIKE '%' || objects.name
            AND (
                fa.visibility = 'public' OR
                (
                    fa.visibility = 'staff_only' AND
                    fa.is_hidden_from_staff = false AND
                    EXISTS (
                        SELECT 1 FROM public.staff_file_permissions sfp
                        WHERE sfp.staff_id = auth.uid() 
                        AND sfp.upload_permission != 'none'
                    )
                ) OR
                (
                    fa.visibility = 'admin_only' AND
                    EXISTS (
                        SELECT 1 FROM public.staff_file_permissions sfp
                        WHERE sfp.staff_id = auth.uid() 
                        AND sfp.can_see_admin_files = true
                    )
                ) OR
                fa.created_by = auth.uid()
            )
        )
        OR
        -- Eigene Uploads kann man immer herunterladen (UUID Vergleich korrigiert)
        objects.owner = auth.uid()
    )
);

-- Delete Policy: Nur Uploader oder Admins (UUID Vergleich korrigiert)
CREATE POLICY "authenticated_delete_own_or_admin" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'file-assets' AND
    (
        -- Admins können alles löschen
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle = 'admin'
        )
        OR
        -- Mitarbeiter nur eigene Dateien (UUID Vergleich korrigiert)
        (
            objects.owner = auth.uid() AND
            EXISTS (
                SELECT 1 FROM public.staff_file_permissions sfp
                WHERE sfp.staff_id = auth.uid() 
                AND sfp.upload_permission != 'none'
            )
        )
    )
);

-- Update Policy: Nur Uploader oder Admins (UUID Vergleich korrigiert)
CREATE POLICY "authenticated_update_own_or_admin" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'file-assets' AND
    (
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle IN ('admin', 'studioleiter')
        )
        OR
        (
            objects.owner = auth.uid() AND
            EXISTS (
                SELECT 1 FROM public.staff_file_permissions sfp
                WHERE sfp.staff_id = auth.uid() 
                AND sfp.upload_permission != 'none'
            )
        )
    )
); 