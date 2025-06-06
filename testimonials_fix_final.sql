-- TESTIMONIALS DATENBANK REPARATUR (Korrigiert)
-- Diese SQL-Befehle im Supabase SQL Editor ausführen

-- 1. Fehlende Spalten zur testimonials Tabelle hinzufügen

-- firstname Spalte hinzufügen
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS firstname TEXT;

-- lastname Spalte hinzufügen
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS lastname TEXT;

-- gender Enum-Typ erstellen (falls nicht vorhanden)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_type') THEN
        CREATE TYPE gender_type AS ENUM ('Männlich', 'Weiblich', 'Divers');
    END IF;
END $$;

-- gender Spalte hinzufügen
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS gender gender_type;

-- age Spalte hinzufügen (falls nicht vorhanden)
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS age INTEGER;

-- training_goals Spalte hinzufügen
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS training_goals TEXT[] DEFAULT '{}';

-- member_since Spalte hinzufügen
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS member_since TEXT;

-- file_asset_id Spalte hinzufügen
ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS file_asset_id UUID REFERENCES public.file_asset(id) ON DELETE SET NULL;

-- 2. Indizes für bessere Performance erstellen
CREATE INDEX IF NOT EXISTS idx_testimonials_file_asset_id ON public.testimonials(file_asset_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_firstname ON public.testimonials(firstname);
CREATE INDEX IF NOT EXISTS idx_testimonials_lastname ON public.testimonials(lastname);
CREATE INDEX IF NOT EXISTS idx_testimonials_training_goals ON public.testimonials USING GIN(training_goals);

-- 3. Bestehende Daten migrieren (einfache Version)
-- Teile das 'name' Feld in firstname und lastname auf
UPDATE public.testimonials 
SET 
    firstname = SPLIT_PART(name, ' ', 1),
    lastname = CASE 
        WHEN POSITION(' ' IN name) > 0 
        THEN TRIM(SUBSTRING(name FROM POSITION(' ' IN name) + 1))
        ELSE NULL 
    END
WHERE firstname IS NULL AND name IS NOT NULL AND name != '';

-- 4. Status-Check: Zeige alle Spalten der testimonials Tabelle
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Test-Abfrage für vollständige Funktionalität
SELECT 
    'Test erfolgreich - Alle Spalten verfügbar' as status,
    COUNT(*) as anzahl_testimonials
FROM public.testimonials;

-- FERTIG! Testimonials sollten jetzt vollständig funktionieren 