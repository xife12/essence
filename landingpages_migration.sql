-- =====================================================
-- Landingpages-Modul: Sichere Datenbank-Migration
-- =====================================================

-- 1. Testimonials Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER,
  location TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text_content TEXT NOT NULL,
  image_id UUID REFERENCES public.file_asset(id),
  campaign_id UUID REFERENCES public.campaigns(id),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Form Templates Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  fields_config JSONB NOT NULL DEFAULT '[]',
  target_table TEXT DEFAULT 'leads',
  redirect_url TEXT,
  success_message TEXT DEFAULT 'Vielen Dank! Wir melden uns bald bei Ihnen.',
  requires_consent BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Page Templates Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.page_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  campaign_type TEXT,
  blocks_config JSONB NOT NULL DEFAULT '[]',
  preview_image_id UUID REFERENCES public.file_asset(id),
  is_system BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.staff(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. CI Templates Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.ci_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT,
  accent_color TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  font_family TEXT DEFAULT 'Inter',
  font_headline TEXT DEFAULT 'Inter',
  font_sizes JSONB DEFAULT '{"h1": "32px", "h2": "24px", "body": "16px"}',
  button_style JSONB DEFAULT '{"radius": "6px", "padding": "12px 24px"}',
  logo_primary_id UUID REFERENCES public.file_asset(id),
  logo_secondary_id UUID REFERENCES public.file_asset(id),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. Landing Settings Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.landing_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('legal', 'tracking', 'cookie', 'general')),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Landingpage Tabelle (falls nicht vorhanden)
CREATE TABLE IF NOT EXISTS public.landingpage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  headline TEXT,
  subheadline TEXT,
  description TEXT,
  design_template TEXT,
  is_active BOOLEAN DEFAULT false,
  tracking_pixel_id TEXT,
  campaign_id UUID REFERENCES public.campaigns(id),
  form_enabled BOOLEAN DEFAULT false,
  form_target_table TEXT DEFAULT 'leads',
  redirect_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Landingpage Block Tabelle (falls nicht vorhanden)  
CREATE TABLE IF NOT EXISTS public.landingpage_block (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landingpage_id UUID REFERENCES public.landingpage(id) ON DELETE CASCADE,
  block_type TEXT NOT NULL CHECK (block_type IN ('text', 'image', 'form', 'button', 'testimonial', 'video', 'headline', 'spacer', 'hero', 'gallery', 'pricing', 'contact')),
  position INTEGER NOT NULL DEFAULT 0,
  content_json JSONB DEFAULT '{}',
  file_asset_id UUID REFERENCES public.file_asset(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- =====================================================
-- Erweitere bestehende Tabellen (sichere Spalten-Ergänzung)
-- =====================================================

-- Erweitere landingpage Tabelle um neue Felder
DO $$ 
BEGIN 
  -- ci_template_id hinzufügen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'ci_template_id') THEN
    ALTER TABLE public.landingpage ADD COLUMN ci_template_id UUID REFERENCES public.ci_templates(id);
  END IF;
  
  -- page_template_id hinzufügen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'page_template_id') THEN
    ALTER TABLE public.landingpage ADD COLUMN page_template_id UUID REFERENCES public.page_templates(id);
  END IF;
  
  -- meta_title hinzufügen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'meta_title') THEN
    ALTER TABLE public.landingpage ADD COLUMN meta_title TEXT;
  END IF;
  
  -- meta_description hinzufügen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'meta_description') THEN
    ALTER TABLE public.landingpage ADD COLUMN meta_description TEXT;
  END IF;
  
  -- og_image_id hinzufügen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'og_image_id') THEN
    ALTER TABLE public.landingpage ADD COLUMN og_image_id UUID REFERENCES public.file_asset(id);
  END IF;
END $$;

-- Erweitere landingpage_block Tabelle um neue Felder
DO $$ 
BEGIN 
  -- form_template_id hinzufügen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage_block' AND column_name = 'form_template_id') THEN
    ALTER TABLE public.landingpage_block ADD COLUMN form_template_id UUID REFERENCES public.form_templates(id);
  END IF;
  
  -- testimonial_id hinzufügen
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage_block' AND column_name = 'testimonial_id') THEN
    ALTER TABLE public.landingpage_block ADD COLUMN testimonial_id UUID REFERENCES public.testimonials(id);
  END IF;
END $$;

-- =====================================================
-- RLS Policies für neue Tabellen
-- =====================================================

-- RLS für testimonials aktivieren
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY testimonials_select ON public.testimonials FOR SELECT USING (true);
CREATE POLICY testimonials_insert ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY testimonials_update ON public.testimonials FOR UPDATE USING (true);
CREATE POLICY testimonials_delete ON public.testimonials FOR DELETE USING (true);

-- RLS für form_templates aktivieren
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY form_templates_select ON public.form_templates FOR SELECT USING (true);
CREATE POLICY form_templates_insert ON public.form_templates FOR INSERT WITH CHECK (true);
CREATE POLICY form_templates_update ON public.form_templates FOR UPDATE USING (true);
CREATE POLICY form_templates_delete ON public.form_templates FOR DELETE USING (true);

-- RLS für page_templates aktivieren
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY page_templates_select ON public.page_templates FOR SELECT USING (true);
CREATE POLICY page_templates_insert ON public.page_templates FOR INSERT WITH CHECK (true);
CREATE POLICY page_templates_update ON public.page_templates FOR UPDATE USING (true);
CREATE POLICY page_templates_delete ON public.page_templates FOR DELETE USING (true);

-- RLS für ci_templates aktivieren
ALTER TABLE public.ci_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY ci_templates_select ON public.ci_templates FOR SELECT USING (true);
CREATE POLICY ci_templates_insert ON public.ci_templates FOR INSERT WITH CHECK (true);
CREATE POLICY ci_templates_update ON public.ci_templates FOR UPDATE USING (true);
CREATE POLICY ci_templates_delete ON public.ci_templates FOR DELETE USING (true);

-- RLS für landing_settings aktivieren
ALTER TABLE public.landing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY landing_settings_select ON public.landing_settings FOR SELECT USING (true);
CREATE POLICY landing_settings_insert ON public.landing_settings FOR INSERT WITH CHECK (true);
CREATE POLICY landing_settings_update ON public.landing_settings FOR UPDATE USING (true);
CREATE POLICY landing_settings_delete ON public.landing_settings FOR DELETE USING (true);

-- RLS für landingpage aktivieren (falls noch nicht aktiv)
ALTER TABLE public.landingpage ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  -- Nur erstellen falls Policy nicht existiert
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage' AND policyname = 'landingpage_select') THEN
    CREATE POLICY landingpage_select ON public.landingpage FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage' AND policyname = 'landingpage_insert') THEN
    CREATE POLICY landingpage_insert ON public.landingpage FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage' AND policyname = 'landingpage_update') THEN
    CREATE POLICY landingpage_update ON public.landingpage FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage' AND policyname = 'landingpage_delete') THEN
    CREATE POLICY landingpage_delete ON public.landingpage FOR DELETE USING (true);
  END IF;
END $$;

-- RLS für landingpage_block aktivieren (falls noch nicht aktiv)
ALTER TABLE public.landingpage_block ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage_block' AND policyname = 'landingpage_block_select') THEN
    CREATE POLICY landingpage_block_select ON public.landingpage_block FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage_block' AND policyname = 'landingpage_block_insert') THEN
    CREATE POLICY landingpage_block_insert ON public.landingpage_block FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage_block' AND policyname = 'landingpage_block_update') THEN
    CREATE POLICY landingpage_block_update ON public.landingpage_block FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landingpage_block' AND policyname = 'landingpage_block_delete') THEN
    CREATE POLICY landingpage_block_delete ON public.landingpage_block FOR DELETE USING (true);
  END IF;
END $$;

-- =====================================================
-- Indizes für Performance
-- =====================================================

-- Indizes für testimonials
CREATE INDEX IF NOT EXISTS idx_testimonials_campaign ON public.testimonials(campaign_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON public.testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_rating ON public.testimonials(rating);

-- Indizes für form_templates
CREATE INDEX IF NOT EXISTS idx_form_templates_active ON public.form_templates(is_active);

-- Indizes für page_templates
CREATE INDEX IF NOT EXISTS idx_page_templates_category ON public.page_templates(category);
CREATE INDEX IF NOT EXISTS idx_page_templates_system ON public.page_templates(is_system);

-- Indizes für ci_templates
CREATE INDEX IF NOT EXISTS idx_ci_templates_default ON public.ci_templates(is_default);

-- Indizes für landing_settings
CREATE INDEX IF NOT EXISTS idx_landing_settings_type ON public.landing_settings(setting_type);
CREATE INDEX IF NOT EXISTS idx_landing_settings_key ON public.landing_settings(setting_key);

-- Indizes für landingpage
CREATE INDEX IF NOT EXISTS idx_landingpage_campaign ON public.landingpage(campaign_id);
CREATE INDEX IF NOT EXISTS idx_landingpage_active ON public.landingpage(is_active);
CREATE INDEX IF NOT EXISTS idx_landingpage_slug ON public.landingpage(slug);

-- Indizes für landingpage_block
CREATE INDEX IF NOT EXISTS idx_landingpage_block_page ON public.landingpage_block(landingpage_id);
CREATE INDEX IF NOT EXISTS idx_landingpage_block_position ON public.landingpage_block(landingpage_id, position);

-- =====================================================
-- Standard-Daten einfügen
-- =====================================================

-- Standard CI-Template erstellen
INSERT INTO public.ci_templates (name, description, primary_color, secondary_color, accent_color, is_default)
VALUES ('Standard CI', 'Standard Corporate Identity Template', '#3B82F6', '#1E40AF', '#10B981', true)
ON CONFLICT DO NOTHING;

-- Standard Settings erstellen
INSERT INTO public.landing_settings (setting_key, setting_value, setting_type, description)
VALUES 
  ('impressum_text', 'Hier steht Ihr Impressum...', 'legal', 'Impressum-Text für Landingpages'),
  ('privacy_policy_text', 'Hier steht Ihre Datenschutzerklärung...', 'legal', 'Datenschutz-Text'),
  ('cookie_banner_text', 'Diese Website verwendet Cookies zur Verbesserung der Nutzererfahrung.', 'cookie', 'Cookie-Banner Text'),
  ('cancel_membership_url', '/mitglieder/kuendigen', 'legal', 'URL für Mitgliedschaft kündigen')
ON CONFLICT (setting_key) DO NOTHING;

-- =====================================================
-- Migration erfolgreich abgeschlossen
-- =====================================================

SELECT 'Landingpages-Migration erfolgreich abgeschlossen!' as status; 