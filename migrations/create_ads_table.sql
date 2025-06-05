-- Erstellen der Tabelle für Werbeanzeigen
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_audience TEXT,
    budget NUMERIC(10, 2),
    duration INTEGER,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    reach INTEGER DEFAULT 0,
    cpl NUMERIC(10, 2) DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    facebook_ad_id TEXT,
    meta_response JSONB
);

-- Index für schnellere Abfragen nach Kampagnen
CREATE INDEX IF NOT EXISTS ads_campaign_id_idx ON public.ads(campaign_id);

-- Funktion zur Aktualisierung des updated_at Timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger für die Aktualisierung des updated_at Felds
DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Kommentare für die Tabelle und Spalten hinzufügen
COMMENT ON TABLE public.ads IS 'Tabelle für Werbeanzeigen im Kampagnenmodul';
COMMENT ON COLUMN public.ads.id IS 'Primärschlüssel';
COMMENT ON COLUMN public.ads.campaign_id IS 'Referenz zur zugehörigen Kampagne';
COMMENT ON COLUMN public.ads.title IS 'Titel der Werbeanzeige';
COMMENT ON COLUMN public.ads.description IS 'Beschreibungstext der Anzeige';
COMMENT ON COLUMN public.ads.target_audience IS 'Zielgruppe der Anzeige';
COMMENT ON COLUMN public.ads.budget IS 'Tagesbudget in Euro';
COMMENT ON COLUMN public.ads.duration IS 'Laufzeit in Tagen';
COMMENT ON COLUMN public.ads.image_url IS 'URL zum Bild der Anzeige';
COMMENT ON COLUMN public.ads.status IS 'Status: draft, active, paused, completed, error';
COMMENT ON COLUMN public.ads.reach IS 'Reichweite (Anzahl der Personen)';
COMMENT ON COLUMN public.ads.cpl IS 'Cost per Lead in Euro';
COMMENT ON COLUMN public.ads.clicks IS 'Anzahl der Klicks';
COMMENT ON COLUMN public.ads.facebook_ad_id IS 'ID der Anzeige bei Facebook/Meta';
COMMENT ON COLUMN public.ads.meta_response IS 'Antwort der Meta API bei Erstellung/Update'; 