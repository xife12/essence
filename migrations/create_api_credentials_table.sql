-- Tabelle für API-Zugangsdaten (OAuth-Tokens etc.)
CREATE TABLE IF NOT EXISTS public.api_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL, -- 'facebook', 'instagram', etc.
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Sicherheitsrichtlinien für die Tabelle
ALTER TABLE public.api_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Nur authentifizierte Benutzer mit admin oder studioleiter Rolle können lesen
CREATE POLICY "Admin/Studioleiter können alle api_credentials lesen" 
  ON public.api_credentials 
  FOR SELECT 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() AND 
      (rolle = 'admin' OR rolle = 'studioleiter')
    )
  );

-- Policy: Nur authentifizierte Benutzer mit admin oder studioleiter Rolle können einfügen
CREATE POLICY "Admin/Studioleiter können api_credentials einfügen" 
  ON public.api_credentials 
  FOR INSERT 
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() AND 
      (rolle = 'admin' OR rolle = 'studioleiter')
    )
  );

-- Policy: Nur authentifizierte Benutzer mit admin oder studioleiter Rolle können aktualisieren
CREATE POLICY "Admin/Studioleiter können api_credentials aktualisieren" 
  ON public.api_credentials 
  FOR UPDATE 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() AND 
      (rolle = 'admin' OR rolle = 'studioleiter')
    )
  );

-- Policy: Nur authentifizierte Benutzer mit admin oder studioleiter Rolle können löschen
CREATE POLICY "Admin/Studioleiter können api_credentials löschen" 
  ON public.api_credentials 
  FOR DELETE 
  USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM public.staff 
      WHERE id = auth.uid() AND 
      (rolle = 'admin' OR rolle = 'studioleiter')
    )
  ); 