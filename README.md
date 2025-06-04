# MemberCore - Fitnessstudio-Verwaltungssystem

Ein internes Verwaltungs- und Tracking-System für Fitnessstudios.

## Funktionen

- Leads-Verwaltung
- Beratungsgespräche
- Mitgliedschaften
- Kampagnen
- Vertragsarten
- Mitarbeiter
- Passwortgeschützte Logins
- Stundenerfassung

## Technologie-Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL)
- **Authentifizierung:** Supabase Auth mit E-Mail + Passwort

## Einrichtung

1. Repository klonen
2. Abhängigkeiten installieren:
   ```
   npm install
   ```

3. Supabase-Projekt erstellen:
   - Besuche [supabase.com](https://supabase.com) und erstelle ein neues Projekt
   - Kopiere deine Projekt-URL und deinen anonymen API-Schlüssel

4. Umgebungsvariablen einrichten:
   - Erstelle eine `.env.local` Datei im Stammverzeichnis mit:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://deine-supabase-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
   ```

5. Entwicklungsserver starten:
   ```
   npm run dev
   ```

## Datenbankschema

Das Projekt verwendet folgende Haupttabellen:
- campaigns
- leads
- consultations
- members
- memberships
- contract_types
- staff
- staff_hours
- secrets

Detaillierte Tabellenstrukturen findest du in den Projektdokumenten. 