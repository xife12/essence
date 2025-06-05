# Facebook API-Integration Einrichtung

## 1. Umgebungsvariablen einstellen

Füge die folgenden Zeilen zu deiner `.env.local` Datei hinzu:

```
# Facebook API-Konfiguration
FACEBOOK_APP_ID=1245629613728659
FACEBOOK_APP_SECRET=131cb8b7d38694e9bc4b85166e9ab3ba
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/callback/facebook

# Für Frontend-Zugriff (z.B. Login-Button)
NEXT_PUBLIC_FACEBOOK_APP_ID=1245629613728659
NEXT_PUBLIC_FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/callback/facebook
```

## 2. Supabase-Tabellen erstellen

Führe folgendes SQL in der Supabase SQL-Konsole aus:

```sql
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
```

## 3. Facebook Developer Einstellungen

1. Gehe zu deiner App im [Facebook Developer Dashboard](https://developers.facebook.com/apps/)
2. Stelle sicher, dass folgende Produkte eingerichtet sind:
   - Facebook Login
   - Marketing API
   - Pages API (optional)

3. Unter "Facebook Login > Einstellungen":
   - Füge `http://localhost:3000/api/auth/callback/facebook` als gültige OAuth-Redirect-URI hinzu
   - Speichere die Änderungen

4. Unter "App Review":
   - Beantrage die erforderlichen Berechtigungen:
     - `ads_management` (für Anzeigenerstellung und -verwaltung)
     - `ads_read` (für Anzeigendaten)
     - `business_management` (falls Business Manager verwendet wird)

## 4. Neustart des Servers

Nach diesen Änderungen starte den Entwicklungsserver neu:

```
npm run dev
```

## 5. Testen der Integration

1. Gehe zur Kampagnen-Seite
2. Klicke auf "Mit Facebook verbinden"
3. Folge dem OAuth-Flow und erteile die angeforderten Berechtigungen
4. Nach erfolgreicher Verbindung kannst du Werbeanzeigen erstellen und verwalten

## Fehlerbehandlung

Falls du Probleme mit der Integration hast:

1. Prüfe, ob deine Facebook-App korrekt konfiguriert ist
2. Überprüfe die Serverlogs auf API-Fehler
3. Stelle sicher, dass die OAuth-Redirect-URI exakt mit der in der Facebook-App eingestellten übereinstimmt
4. Prüfe, ob die Tabelle `api_credentials` in Supabase korrekt erstellt wurde und die entsprechenden Policies hat 