-- Vereinfachte Storage Policies für schnelle Lösung
-- Diese Policies sind weniger restriktiv aber funktional

-- Alle bestehenden Policies löschen
DROP POLICY IF EXISTS "authenticated_upload_with_permission" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_download_with_permission" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_or_admin" ON storage.objects;

-- Vereinfachte Upload Policy: Alle authentifizierten User können uploaden
CREATE POLICY "allow_authenticated_uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'file-assets');

-- Vereinfachte Download Policy: Alle authentifizierten User können downloaden
CREATE POLICY "allow_authenticated_downloads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'file-assets');

-- Vereinfachte Delete Policy: User können nur eigene Dateien löschen
CREATE POLICY "allow_own_file_deletes" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'file-assets' AND 
    auth.uid()::text = owner
);

-- Vereinfachte Update Policy: User können nur eigene Dateien updaten
CREATE POLICY "allow_own_file_updates" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'file-assets' AND 
    auth.uid()::text = owner
);

-- Info-Kommentar
COMMENT ON POLICY "allow_authenticated_uploads" ON storage.objects IS 
'Vereinfachte Policy: Alle authentifizierten Benutzer können Dateien hochladen';

COMMENT ON POLICY "allow_authenticated_downloads" ON storage.objects IS 
'Vereinfachte Policy: Alle authentifizierten Benutzer können Dateien herunterladen';

COMMENT ON POLICY "allow_own_file_deletes" ON storage.objects IS 
'User können nur eigene hochgeladene Dateien löschen';

COMMENT ON POLICY "allow_own_file_updates" ON storage.objects IS 
'User können nur eigene hochgeladene Dateien bearbeiten'; 