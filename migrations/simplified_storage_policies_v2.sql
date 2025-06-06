-- KORRIGIERTE Vereinfachte Storage Policies 
-- Alle Type-Cast Fehler behoben

-- Alle bestehenden Policies löschen
DROP POLICY IF EXISTS "authenticated_upload_with_permission" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_download_with_permission" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_or_admin" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_uploads" ON storage.objects;
DROP POLICY IF EXISTS "allow_authenticated_downloads" ON storage.objects;
DROP POLICY IF EXISTS "allow_own_file_deletes" ON storage.objects;
DROP POLICY IF EXISTS "allow_own_file_updates" ON storage.objects;

-- Upload Policy: Alle authentifizierten User können uploaden
CREATE POLICY "allow_authenticated_uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'file-assets');

-- Download Policy: Alle authentifizierten User können downloaden
CREATE POLICY "allow_authenticated_downloads" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'file-assets');

-- Delete Policy: User können nur eigene Dateien löschen (KORRIGIERT)
CREATE POLICY "allow_own_file_deletes" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'file-assets' AND 
    owner = auth.uid()
);

-- Update Policy: User können nur eigene Dateien updaten (KORRIGIERT)  
CREATE POLICY "allow_own_file_updates" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'file-assets' AND 
    owner = auth.uid()
);

-- Info-Kommentare
COMMENT ON POLICY "allow_authenticated_uploads" ON storage.objects IS 
'Alle authentifizierten Benutzer können Dateien hochladen';

COMMENT ON POLICY "allow_authenticated_downloads" ON storage.objects IS 
'Alle authentifizierten Benutzer können Dateien herunterladen';

COMMENT ON POLICY "allow_own_file_deletes" ON storage.objects IS 
'User können nur eigene hochgeladene Dateien löschen (owner = auth.uid())';

COMMENT ON POLICY "allow_own_file_updates" ON storage.objects IS 
'User können nur eigene hochgeladene Dateien bearbeiten (owner = auth.uid())'; 