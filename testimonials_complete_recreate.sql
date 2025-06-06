-- Alternative: Testimonials Tabelle komplett neu erstellen
-- Verwenden Sie dieses Skript nur, wenn das erweiterte Skript nicht funktioniert

-- WARNUNG: Dies löscht alle bestehenden Testimonials!
-- Sicherung vorher erstellen falls nötig:
-- CREATE TABLE testimonials_backup AS SELECT * FROM testimonials;

-- Schritt 1: Tabelle löschen falls sie existiert
DROP TABLE IF EXISTS public.testimonials CASCADE;

-- Schritt 2: Tabelle komplett neu erstellen
CREATE TABLE public.testimonials (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name text NOT NULL,
    age integer,
    location text,
    rating integer NOT NULL DEFAULT 5,
    text_content text NOT NULL,
    image_id text,
    file_asset_id uuid,
    tags text[] DEFAULT '{}',
    training_goals text[] DEFAULT '{}',
    member_since date,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT testimonials_pkey PRIMARY KEY (id),
    CONSTRAINT testimonials_rating_check CHECK ((rating >= 1) AND (rating <= 5))
);

-- Schritt 3: RLS aktivieren
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Schritt 4: Policies erstellen
CREATE POLICY "testimonials_select_policy" ON public.testimonials
    FOR SELECT USING (true);

CREATE POLICY "testimonials_insert_policy" ON public.testimonials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "testimonials_update_policy" ON public.testimonials
    FOR UPDATE USING (true);

CREATE POLICY "testimonials_delete_policy" ON public.testimonials
    FOR DELETE USING (true);

-- Schritt 5: Trigger für updated_at erstellen
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Schritt 6: Fremdschlüssel hinzufügen (falls file_asset existiert)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'file_asset' AND table_schema = 'public') THEN
        ALTER TABLE public.testimonials 
        ADD CONSTRAINT testimonials_file_asset_id_fkey 
        FOREIGN KEY (file_asset_id) REFERENCES public.file_asset(id) ON DELETE SET NULL;
        RAISE NOTICE 'Added foreign key constraint to file_asset table';
    ELSE
        RAISE NOTICE 'file_asset table does not exist, skipping foreign key constraint';
    END IF;
END
$$;

-- Schritt 7: Grants setzen
GRANT ALL ON public.testimonials TO postgres, anon, authenticated;

-- Test-Einfügung
INSERT INTO public.testimonials (
    name, 
    age, 
    location, 
    rating, 
    text_content, 
    tags, 
    training_goals, 
    member_since, 
    is_active
) VALUES (
    'Test User',
    30,
    'Berlin',
    5,
    'Das ist ein Testkommentar',
    ARRAY['fitness', 'motivation']::text[],
    ARRAY['abnehmen', 'muskelaufbau']::text[],
    '2023-01-01'::date,
    true
);

-- Anzeige der finalen Tabellenstruktur
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
  AND table_schema = 'public'
ORDER BY ordinal_position; 