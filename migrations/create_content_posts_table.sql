-- Erstellen der Tabelle für Content-Posts
CREATE TABLE IF NOT EXISTS public.content_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    post_date TIMESTAMP WITH TIME ZONE NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'geplant', -- 'geplant', 'veröffentlicht', 'gescheitert'
    facebook_post_id TEXT,
    instagram_post_id TEXT,
    linkedin_post_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index für schnellere Abfragen
CREATE INDEX IF NOT EXISTS content_posts_campaign_id_idx ON public.content_posts(campaign_id);
CREATE INDEX IF NOT EXISTS content_posts_post_date_idx ON public.content_posts(post_date);
CREATE INDEX IF NOT EXISTS content_posts_channel_idx ON public.content_posts(channel);

-- Trigger für die Aktualisierung des updated_at Felds
DROP TRIGGER IF EXISTS update_content_posts_updated_at ON public.content_posts;
CREATE TRIGGER update_content_posts_updated_at
BEFORE UPDATE ON public.content_posts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Kommentare für die Tabelle und Spalten hinzufügen
COMMENT ON TABLE public.content_posts IS 'Tabelle für Content-Posts im Kampagnenmodul';
COMMENT ON COLUMN public.content_posts.id IS 'Primärschlüssel';
COMMENT ON COLUMN public.content_posts.campaign_id IS 'Referenz zur zugehörigen Kampagne';
COMMENT ON COLUMN public.content_posts.title IS 'Titel des Beitrags';
COMMENT ON COLUMN public.content_posts.content IS 'Textinhalt des Beitrags';
COMMENT ON COLUMN public.content_posts.media_url IS 'URL zum Bild/Video des Beitrags';
COMMENT ON COLUMN public.content_posts.post_date IS 'Geplantes Veröffentlichungsdatum';
COMMENT ON COLUMN public.content_posts.channel IS 'Kanal (Facebook, Instagram, LinkedIn, etc.)';
COMMENT ON COLUMN public.content_posts.status IS 'Status des Beitrags';
COMMENT ON COLUMN public.content_posts.facebook_post_id IS 'ID des Facebook-Posts bei erfolgreicher Veröffentlichung';
COMMENT ON COLUMN public.content_posts.instagram_post_id IS 'ID des Instagram-Posts bei erfolgreicher Veröffentlichung';
COMMENT ON COLUMN public.content_posts.linkedin_post_id IS 'ID des LinkedIn-Posts bei erfolgreicher Veröffentlichung'; 