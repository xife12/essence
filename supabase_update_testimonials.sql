-- =====================================================
-- SUPABASE UPDATE: Testimonials + File Assets (Korrigiert)
-- Diese SQL-Befehle in der Supabase SQL-Konsole ausführen
-- =====================================================

-- 1. file_asset Tabelle erstellen (vereinfacht, ohne Enums)
CREATE TABLE IF NOT EXISTS public.file_asset (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'image',
  type TEXT DEFAULT 'testimonial',
  work_area TEXT DEFAULT 'Marketing',
  campaign_id UUID,
  module_reference TEXT DEFAULT 'landingpage',
  is_print_ready BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. testimonials Tabelle erstellen (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text_content TEXT NOT NULL,
  image_id UUID,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Neue Felder zu testimonials hinzufügen
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS file_asset_id UUID REFERENCES public.file_asset(id);

ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS training_goals TEXT[] DEFAULT '{}';

ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS member_since DATE;

-- 4. RLS (Row Level Security) aktivieren
ALTER TABLE public.file_asset ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 5. Policies für public access (Development) - DROP und CREATE
-- file_asset Policies
DROP POLICY IF EXISTS "file_asset_select" ON public.file_asset;
DROP POLICY IF EXISTS "file_asset_insert" ON public.file_asset;
DROP POLICY IF EXISTS "file_asset_update" ON public.file_asset;
DROP POLICY IF EXISTS "file_asset_delete" ON public.file_asset;

CREATE POLICY "file_asset_select" ON public.file_asset FOR SELECT USING (true);
CREATE POLICY "file_asset_insert" ON public.file_asset FOR INSERT WITH CHECK (true);
CREATE POLICY "file_asset_update" ON public.file_asset FOR UPDATE USING (true);
CREATE POLICY "file_asset_delete" ON public.file_asset FOR DELETE USING (true);

-- testimonials Policies
DROP POLICY IF EXISTS "testimonials_select" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_insert" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_update" ON public.testimonials;
DROP POLICY IF EXISTS "testimonials_delete" ON public.testimonials;

CREATE POLICY "testimonials_select" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "testimonials_insert" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "testimonials_update" ON public.testimonials FOR UPDATE USING (true);
CREATE POLICY "testimonials_delete" ON public.testimonials FOR DELETE USING (true);

-- 6. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_file_asset_category ON public.file_asset(category);
CREATE INDEX IF NOT EXISTS idx_file_asset_type ON public.file_asset(type);
CREATE INDEX IF NOT EXISTS idx_testimonials_file_asset ON public.testimonials(file_asset_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_training_goals ON public.testimonials USING GIN(training_goals);

-- 7. Storage Bucket für Assets erstellen
-- Achtung: Dies muss manuell in der Supabase UI gemacht werden!
-- Gehe zu Storage > "Create Bucket" > Name: "assets" > Public: Yes

-- 8. Storage Policies für public access
-- Diese müssen auch über die Supabase UI erstellt werden

-- =====================================================
-- ZUSÄTZLICH BENÖTIGT: Storage Bucket Setup
-- =====================================================
-- 1. Gehe zu Supabase Dashboard > Storage
-- 2. Klicke "Create Bucket"
-- 3. Name: "assets"
-- 4. Public: "Yes" (aktivieren)
-- 5. Speichern

-- =====================================================
-- FERTIG! Die Testimonials sind jetzt vollständig unterstützt
-- =====================================================

-- TESTIMONIALS DATABASE UPDATE
-- Diese SQL-Befehle manuell im Supabase SQL Editor ausführen

-- 1. Fehlende Spalten hinzufügen (falls sie noch nicht existieren)

-- firstname Spalte
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS firstname TEXT;

-- lastname Spalte  
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS lastname TEXT;

-- gender Spalte mit Enum
DO $$ 
BEGIN
    -- Prüfe ob der Enum-Typ existiert
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('Männlich', 'Weiblich', 'Divers');
    END IF;
END $$;

ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS gender gender_type;

-- Weitere neue Spalten
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS training_goals TEXT[] DEFAULT '{}';
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS member_since TEXT;
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS file_asset_id UUID REFERENCES public.file_asset(id) ON DELETE SET NULL;

-- 2. Bestehende Daten migrieren (falls name Feld vorhanden)
UPDATE public.testimonials 
SET firstname = SPLIT_PART(name, ' ', 1),
    lastname = CASE 
        WHEN POSITION(' ' IN name) > 0 
        THEN TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1))
        ELSE NULL 
    END
WHERE firstname IS NULL AND name IS NOT NULL;

-- 3. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_testimonials_file_asset_id ON public.testimonials(file_asset_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_firstname ON public.testimonials(firstname);
CREATE INDEX IF NOT EXISTS idx_testimonials_lastname ON public.testimonials(lastname);

-- 4. Update RLS Policies (falls nötig)
-- Die bestehenden Policies sollten automatisch für neue Spalten gelten

-- Status prüfen
SELECT 
    'firstname' as spalte, 
    COUNT(*) as anzahl_datensaetze
FROM information_schema.columns 
WHERE table_name = 'testimonials' AND column_name = 'firstname'

UNION ALL

SELECT 
    'lastname' as spalte, 
    COUNT(*) as anzahl_datensaetze  
FROM information_schema.columns 
WHERE table_name = 'testimonials' AND column_name = 'lastname'

UNION ALL

SELECT 
    'file_asset_id' as spalte, 
    COUNT(*) as anzahl_datensaetze
FROM information_schema.columns 
WHERE table_name = 'testimonials' AND column_name = 'file_asset_id';

-- Falls alles erfolgreich war, sollten alle Spalten 1 Datensatz zeigen 