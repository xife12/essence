-- Fix für Upload-Berechtigungen
-- Gibt allen existierenden Benutzern Upload-Berechtigungen

-- Alle bestehenden Staff-Mitglieder bekommen Upload-Berechtigung
INSERT INTO public.staff_file_permissions (staff_id, upload_permission, can_see_admin_files)
SELECT 
    s.id, 
    CASE 
        WHEN s.rolle IN ('admin', 'studioleiter') THEN 'all_files'::upload_permission
        ELSE 'own_files'::upload_permission
    END,
    CASE 
        WHEN s.rolle IN ('admin', 'studioleiter') THEN true
        ELSE false
    END
FROM public.staff s
WHERE NOT EXISTS (
    SELECT 1 FROM public.staff_file_permissions sfp 
    WHERE sfp.staff_id = s.id
);

-- Alternative: Falls staff-Tabelle leer ist, erstelle temporären Admin-User
-- (Nur ausführen falls kein Staff existiert)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.staff LIMIT 1) THEN
        -- Erstelle temporären Admin-Eintrag für aktuellen User
        INSERT INTO public.staff (id, rolle) 
        SELECT auth.uid(), 'admin'
        WHERE auth.uid() IS NOT NULL
        ON CONFLICT (id) DO UPDATE SET rolle = 'admin';
        
        -- Gebe Admin-Berechtigungen
        INSERT INTO public.staff_file_permissions (staff_id, upload_permission, can_see_admin_files)
        SELECT auth.uid(), 'all_files'::upload_permission, true
        WHERE auth.uid() IS NOT NULL
        ON CONFLICT (staff_id) DO UPDATE SET 
            upload_permission = 'all_files',
            can_see_admin_files = true;
    END IF;
END $$; 