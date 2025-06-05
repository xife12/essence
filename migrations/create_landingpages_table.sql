-- Erstellen der Tabelle für Landingpages
CREATE TABLE IF NOT EXISTS public.landingpages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    url_slug TEXT NOT NULL UNIQUE,
    template_type TEXT NOT NULL,
    headline TEXT NOT NULL,
    content JSONB NOT NULL,
    is_published BOOLEAN DEFAULT false,
    visits INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index für schnellere Abfragen nach Kampagnen
CREATE INDEX IF NOT EXISTS landingpages_campaign_id_idx ON public.landingpages(campaign_id);
CREATE INDEX IF NOT EXISTS landingpages_url_slug_idx ON public.landingpages(url_slug);

-- Trigger für die Aktualisierung des updated_at Felds
DROP TRIGGER IF EXISTS update_landingpages_updated_at ON public.landingpages;
CREATE TRIGGER update_landingpages_updated_at
BEFORE UPDATE ON public.landingpages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Kommentare für die Tabelle und Spalten hinzufügen
COMMENT ON TABLE public.landingpages IS 'Tabelle für Landingpages im Kampagnenmodul';
COMMENT ON COLUMN public.landingpages.id IS 'Primärschlüssel';
COMMENT ON COLUMN public.landingpages.campaign_id IS 'Referenz zur zugehörigen Kampagne';
COMMENT ON COLUMN public.landingpages.url_slug IS 'URL-Slug für die Landingpage';
COMMENT ON COLUMN public.landingpages.template_type IS 'Art des Templates (angebot, emotion, testimonial, vergleich)';
COMMENT ON COLUMN public.landingpages.headline IS 'Hauptüberschrift der Landingpage';
COMMENT ON COLUMN public.landingpages.content IS 'JSON-Struktur mit allen Inhalten';
COMMENT ON COLUMN public.landingpages.is_published IS 'Veröffentlichungsstatus';
COMMENT ON COLUMN public.landingpages.visits IS 'Anzahl der Besuche';
COMMENT ON COLUMN public.landingpages.conversions IS 'Anzahl der Conversions'; 