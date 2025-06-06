-- Migration: Dateimanager (file_asset) Modul
-- Erstellt die Tabelle für zentrale Dateiablage und Medienverwaltung

-- ENUMs erstellen
CREATE TYPE file_category AS ENUM (
    'image',
    'graphic', 
    'document',
    'print',
    'template',
    'web',
    'video'
);

CREATE TYPE work_area_type AS ENUM (
    'Trainer',
    'Rezeption', 
    'Service',
    'Verwaltung',
    'Studioleitung'
);

CREATE TYPE module_reference_type AS ENUM (
    'campaign',
    'landingpage',
    'system',
    'task',
    'contentplaner'
);

-- Haupttabelle file_asset erstellen
CREATE TABLE public.file_asset (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    file_url TEXT NOT NULL,
    category file_category NOT NULL,
    type TEXT,
    work_area work_area_type,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    module_reference module_reference_type DEFAULT 'system',
    is_print_ready BOOLEAN DEFAULT false,
    tags TEXT[],
    description TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indizes für bessere Performance
CREATE INDEX idx_file_asset_category ON public.file_asset(category);
CREATE INDEX idx_file_asset_work_area ON public.file_asset(work_area);
CREATE INDEX idx_file_asset_campaign_id ON public.file_asset(campaign_id);
CREATE INDEX idx_file_asset_module_reference ON public.file_asset(module_reference);
CREATE INDEX idx_file_asset_created_by ON public.file_asset(created_by);
CREATE INDEX idx_file_asset_tags ON public.file_asset USING GIN(tags);
CREATE INDEX idx_file_asset_filename ON public.file_asset(filename);

-- Updated_at Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_file_asset_updated_at 
    BEFORE UPDATE ON public.file_asset 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE public.file_asset ENABLE ROW LEVEL SECURITY;

-- Policy: Alle authentifizierten Benutzer können Dateien sehen
CREATE POLICY "file_asset_select_policy" ON public.file_asset
    FOR SELECT TO authenticated
    USING (true);

-- Policy: Alle authentifizierten Benutzer können Dateien hochladen
CREATE POLICY "file_asset_insert_policy" ON public.file_asset
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Policy: Nur Ersteller und Admins können Dateien bearbeiten
CREATE POLICY "file_asset_update_policy" ON public.file_asset
    FOR UPDATE TO authenticated
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle IN ('admin', 'studioleiter')
        )
    );

-- Policy: Nur Ersteller und Admins können Dateien löschen
CREATE POLICY "file_asset_delete_policy" ON public.file_asset
    FOR DELETE TO authenticated
    USING (
        auth.uid() = created_by OR
        EXISTS (
            SELECT 1 FROM public.staff 
            WHERE staff.id = auth.uid() 
            AND staff.rolle = 'admin'
        )
    );

-- Kommentare zur Dokumentation
COMMENT ON TABLE public.file_asset IS 'Zentrale Dateiablage und Medienverwaltung';
COMMENT ON COLUMN public.file_asset.filename IS 'Ursprünglicher Dateiname';
COMMENT ON COLUMN public.file_asset.file_url IS 'Speicherpfad (z.B. Supabase Storage)';
COMMENT ON COLUMN public.file_asset.category IS 'Hauptkategorie der Datei';
COMMENT ON COLUMN public.file_asset.type IS 'Unterkategorie wie flyer, logo, testimonial, hero-banner';
COMMENT ON COLUMN public.file_asset.work_area IS 'Zielbereich: Trainer, Rezeption, Verwaltung, Marketing';
COMMENT ON COLUMN public.file_asset.campaign_id IS 'Optional: Verknüpfung zu campaign.id';
COMMENT ON COLUMN public.file_asset.module_reference IS 'Modulkontext: system, landingpage, task, campaign';
COMMENT ON COLUMN public.file_asset.is_print_ready IS 'true = finale Druckdatei';
COMMENT ON COLUMN public.file_asset.tags IS 'Freie Schlagworte für Filter und Suche';
COMMENT ON COLUMN public.file_asset.description IS 'Beschreibung oder Einsatzzweck';
COMMENT ON COLUMN public.file_asset.created_by IS 'Uploader (Mitarbeiter)'; 