-- Erstellen der Tabelle für Kampagnen
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'aktiv',
    campaign_type TEXT,
    target_group TEXT,
    bonus_period INTERVAL,
    channels TEXT[],
    contract_type_ids UUID[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS campaigns_status_idx ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS campaigns_date_range_idx ON public.campaigns(start_date, end_date);

-- Trigger für die Aktualisierung des updated_at Felds
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Kommentare für die Tabelle und Spalten hinzufügen
COMMENT ON TABLE public.campaigns IS 'Tabelle für Marketing-Kampagnen';
COMMENT ON COLUMN public.campaigns.id IS 'Primärschlüssel';
COMMENT ON COLUMN public.campaigns.name IS 'Name der Kampagne';
COMMENT ON COLUMN public.campaigns.description IS 'Beschreibung der Kampagne';
COMMENT ON COLUMN public.campaigns.start_date IS 'Startdatum der Kampagne';
COMMENT ON COLUMN public.campaigns.end_date IS 'Enddatum der Kampagne';
COMMENT ON COLUMN public.campaigns.status IS 'Status der Kampagne (aktiv, inaktiv, geplant, beendet)';
COMMENT ON COLUMN public.campaigns.campaign_type IS 'Typ der Kampagne (z.B. Mitglieder-Aktion, Neukunden)';
COMMENT ON COLUMN public.campaigns.target_group IS 'Zielgruppe der Kampagne';
COMMENT ON COLUMN public.campaigns.bonus_period IS 'Bonuszeitraum bei Vertragsabschluss';
COMMENT ON COLUMN public.campaigns.channels IS 'Kanäle, auf denen die Kampagne läuft';
COMMENT ON COLUMN public.campaigns.contract_type_ids IS 'Vertragsarten, die mit dieser Kampagne verbunden sind'; 