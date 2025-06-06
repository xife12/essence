-- Einfache Lösung: Bucket auf public setzen
-- Dadurch werden keine komplexen Storage Policies benötigt

-- Bucket auf public setzen (falls er noch private ist)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'file-assets';

-- Falls der Bucket noch nicht existiert, erstelle ihn als public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('file-assets', 'file-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Kommentar
COMMENT ON TABLE storage.buckets IS 'file-assets Bucket wurde auf public gesetzt für einfachen Zugriff'; 