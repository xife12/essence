-- Testimonials Tabelle um firstname, lastname und gender erweitern
DO $$
BEGIN
    -- Firstname hinzufügen (falls nicht vorhanden)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'firstname'
    ) THEN
        ALTER TABLE public.testimonials ADD COLUMN firstname TEXT;
        RAISE NOTICE 'Spalte firstname hinzugefügt';
    ELSE
        RAISE NOTICE 'Spalte firstname existiert bereits';
    END IF;

    -- Lastname hinzufügen (falls nicht vorhanden)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'lastname'
    ) THEN
        ALTER TABLE public.testimonials ADD COLUMN lastname TEXT;
        RAISE NOTICE 'Spalte lastname hinzugefügt';
    ELSE
        RAISE NOTICE 'Spalte lastname existiert bereits';
    END IF;

    -- Gender hinzufügen (falls nicht vorhanden)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'gender'
    ) THEN
        ALTER TABLE public.testimonials ADD COLUMN gender TEXT CHECK (gender IN ('Männlich', 'Weiblich', 'Divers'));
        RAISE NOTICE 'Spalte gender hinzugefügt';
    ELSE
        RAISE NOTICE 'Spalte gender existiert bereits';
    END IF;
END $$;

-- Bestehende name-Daten in firstname übertragen (falls firstname leer ist)
UPDATE public.testimonials 
SET firstname = name 
WHERE firstname IS NULL OR firstname = '';

-- Kommentare hinzufügen
COMMENT ON COLUMN public.testimonials.firstname IS 'Vorname der Person';
COMMENT ON COLUMN public.testimonials.lastname IS 'Nachname der Person';
COMMENT ON COLUMN public.testimonials.gender IS 'Geschlecht: Männlich, Weiblich oder Divers'; 