-- =====================================================
-- Landingpages-Modul: Finale sichere Datenbank-Migration
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

-- Erweitere landingpage Tabelle um alle fehlenden Felder
DO $$ 
BEGIN 
  -- is_active hinzufügen falls nicht vorhanden
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'is_active') THEN
    ALTER TABLE public.landingpage ADD COLUMN is_active BOOLEAN DEFAULT false;
  END IF;

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

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'testimonials_select') THEN
    CREATE POLICY testimonials_select ON public.testimonials FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'testimonials_insert') THEN
    CREATE POLICY testimonials_insert ON public.testimonials FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'testimonials_update') THEN
    CREATE POLICY testimonials_update ON public.testimonials FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'testimonials' AND policyname = 'testimonials_delete') THEN
    CREATE POLICY testimonials_delete ON public.testimonials FOR DELETE USING (true);
  END IF;
END $$;

-- RLS für form_templates aktivieren
ALTER TABLE public.form_templates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_templates' AND policyname = 'form_templates_select') THEN
    CREATE POLICY form_templates_select ON public.form_templates FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_templates' AND policyname = 'form_templates_insert') THEN
    CREATE POLICY form_templates_insert ON public.form_templates FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_templates' AND policyname = 'form_templates_update') THEN
    CREATE POLICY form_templates_update ON public.form_templates FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_templates' AND policyname = 'form_templates_delete') THEN
    CREATE POLICY form_templates_delete ON public.form_templates FOR DELETE USING (true);
  END IF;
END $$;

-- RLS für page_templates aktivieren
ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_templates' AND policyname = 'page_templates_select') THEN
    CREATE POLICY page_templates_select ON public.page_templates FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_templates' AND policyname = 'page_templates_insert') THEN
    CREATE POLICY page_templates_insert ON public.page_templates FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_templates' AND policyname = 'page_templates_update') THEN
    CREATE POLICY page_templates_update ON public.page_templates FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'page_templates' AND policyname = 'page_templates_delete') THEN
    CREATE POLICY page_templates_delete ON public.page_templates FOR DELETE USING (true);
  END IF;
END $$;

-- RLS für ci_templates aktivieren
ALTER TABLE public.ci_templates ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ci_templates' AND policyname = 'ci_templates_select') THEN
    CREATE POLICY ci_templates_select ON public.ci_templates FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ci_templates' AND policyname = 'ci_templates_insert') THEN
    CREATE POLICY ci_templates_insert ON public.ci_templates FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ci_templates' AND policyname = 'ci_templates_update') THEN
    CREATE POLICY ci_templates_update ON public.ci_templates FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ci_templates' AND policyname = 'ci_templates_delete') THEN
    CREATE POLICY ci_templates_delete ON public.ci_templates FOR DELETE USING (true);
  END IF;
END $$;

-- RLS für landing_settings aktivieren
ALTER TABLE public.landing_settings ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landing_settings' AND policyname = 'landing_settings_select') THEN
    CREATE POLICY landing_settings_select ON public.landing_settings FOR SELECT USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landing_settings' AND policyname = 'landing_settings_insert') THEN
    CREATE POLICY landing_settings_insert ON public.landing_settings FOR INSERT WITH CHECK (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landing_settings' AND policyname = 'landing_settings_update') THEN
    CREATE POLICY landing_settings_update ON public.landing_settings FOR UPDATE USING (true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'landing_settings' AND policyname = 'landing_settings_delete') THEN
    CREATE POLICY landing_settings_delete ON public.landing_settings FOR DELETE USING (true);
  END IF;
END $$;

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
-- Sichere Index-Erstellung (nur wenn Spalten existieren)
-- =====================================================

DO $$ 
BEGIN 
  -- Indizes für testimonials (nur wenn Spalten existieren)
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'is_active') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'testimonials' AND indexname = 'idx_testimonials_active') THEN
      CREATE INDEX idx_testimonials_active ON public.testimonials(is_active);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'testimonials' AND column_name = 'rating') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'testimonials' AND indexname = 'idx_testimonials_rating') THEN
      CREATE INDEX idx_testimonials_rating ON public.testimonials(rating);
    END IF;
  END IF;

  -- Indizes für form_templates
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'form_templates' AND column_name = 'is_active') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'form_templates' AND indexname = 'idx_form_templates_active') THEN
      CREATE INDEX idx_form_templates_active ON public.form_templates(is_active);
    END IF;
  END IF;

  -- Indizes für page_templates
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_templates' AND column_name = 'category') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'page_templates' AND indexname = 'idx_page_templates_category') THEN
      CREATE INDEX idx_page_templates_category ON public.page_templates(category);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'page_templates' AND column_name = 'is_system') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'page_templates' AND indexname = 'idx_page_templates_system') THEN
      CREATE INDEX idx_page_templates_system ON public.page_templates(is_system);
    END IF;
  END IF;

  -- Indizes für ci_templates
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ci_templates' AND column_name = 'is_default') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'ci_templates' AND indexname = 'idx_ci_templates_default') THEN
      CREATE INDEX idx_ci_templates_default ON public.ci_templates(is_default);
    END IF;
  END IF;

  -- Indizes für landing_settings
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landing_settings' AND column_name = 'setting_type') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'landing_settings' AND indexname = 'idx_landing_settings_type') THEN
      CREATE INDEX idx_landing_settings_type ON public.landing_settings(setting_type);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landing_settings' AND column_name = 'setting_key') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'landing_settings' AND indexname = 'idx_landing_settings_key') THEN
      CREATE INDEX idx_landing_settings_key ON public.landing_settings(setting_key);
    END IF;
  END IF;

  -- Indizes für landingpage
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'is_active') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'landingpage' AND indexname = 'idx_landingpage_active') THEN
      CREATE INDEX idx_landingpage_active ON public.landingpage(is_active);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage' AND column_name = 'slug') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'landingpage' AND indexname = 'idx_landingpage_slug') THEN
      CREATE INDEX idx_landingpage_slug ON public.landingpage(slug);
    END IF;
  END IF;

  -- Indizes für landingpage_block
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage_block' AND column_name = 'landingpage_id') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'landingpage_block' AND indexname = 'idx_landingpage_block_page') THEN
      CREATE INDEX idx_landingpage_block_page ON public.landingpage_block(landingpage_id);
    END IF;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage_block' AND column_name = 'landingpage_id') 
     AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'landingpage_block' AND column_name = 'position') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'landingpage_block' AND indexname = 'idx_landingpage_block_position') THEN
      CREATE INDEX idx_landingpage_block_position ON public.landingpage_block(landingpage_id, position);
    END IF;
  END IF;
END $$;

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

-- =====================================================
-- OPTIONAL: Kampagnen-Integration (später hinzufügen)
-- =====================================================
-- Diese Zeilen kannst du später ausführen, wenn das Kampagnen-Modul existiert:

-- ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS campaign_id UUID;
-- ALTER TABLE public.landingpage ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- Dann Foreign Key Constraints hinzufügen:
-- ALTER TABLE public.testimonials ADD CONSTRAINT fk_testimonials_campaign 
--   FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id);
-- ALTER TABLE public.landingpage ADD CONSTRAINT fk_landingpage_campaign 
--   FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id); 