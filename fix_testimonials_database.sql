-- Fehlende Spalten zur testimonials Tabelle hinzufügen
DO $$ 
BEGIN
    -- firstname hinzufügen 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'firstname'
    ) THEN
        ALTER TABLE public.testimonials ADD COLUMN firstname TEXT;
        RAISE NOTICE 'Spalte firstname hinzugefügt';
    ELSE
        RAISE NOTICE 'Spalte firstname existiert bereits';
    END IF;

    -- lastname hinzufügen 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'lastname'
    ) THEN
        ALTER TABLE public.testimonials ADD COLUMN lastname TEXT;
        RAISE NOTICE 'Spalte lastname hinzugefügt';
    ELSE
        RAISE NOTICE 'Spalte lastname existiert bereits';
    END IF;

    -- gender hinzufügen 
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

-- Status abfragen
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
ORDER BY ordinal_position; 