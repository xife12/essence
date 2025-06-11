-- Aktualisierung für den neuen CI-Styling Workflow
-- Logos und Zielgruppen werden jetzt direkt in den ci_templates verwaltet

-- Neue Felder für Logos in ci_templates (als JSON-Array)
ALTER TABLE ci_templates 
ADD COLUMN logos JSONB DEFAULT '{}',
ADD COLUMN target_audience_detailed JSONB DEFAULT '{}',
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Update Kommentar für die Tabelle
COMMENT ON COLUMN ci_templates.logos IS 'Logo-Verweise als JSON: {"primary": "file_asset_id", "white": "file_asset_id", ...}';
COMMENT ON COLUMN ci_templates.target_audience_detailed IS 'Detaillierte Zielgruppen-Informationen als JSON';
COMMENT ON COLUMN ci_templates.tags IS 'Tags für bessere Kategorisierung und Suche';

-- Beispiel für die JSON-Struktur der Logos:
-- {
--   "primary": "uuid-of-file-asset",
--   "white": "uuid-of-file-asset", 
--   "black": "uuid-of-file-asset",
--   "favicon": "uuid-of-file-asset"
-- }

-- Beispiel für target_audience_detailed:
-- {
--   "description": "Junge Erwachsene 18-35",
--   "age_min": 18,
--   "age_max": 35,
--   "gender": "all",
--   "interests": ["fitness", "wellness"],
--   "location": "Deutschland"
-- } 