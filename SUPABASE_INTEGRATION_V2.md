# 🚀 Supabase Integration - Vertragsarten V2 System

## Übersicht

Diese Anleitung beschreibt die vollständige Integration des **Vertragsarten V2 Systems** mit **Supabase** als Backend-Datenbank. Das System nutzt moderne PostgreSQL-Features, Row Level Security (RLS) und integriert sich nahtlos in die bestehende Next.js-Anwendung.

## 📋 Voraussetzungen

### 1. Supabase Projekt
- **Supabase Konto**: [https://app.supabase.com](https://app.supabase.com)
- **Neues Projekt** erstellt oder bestehendes verwenden
- **PostgreSQL Version 15+** (Standard bei Supabase)

### 2. Lokale Entwicklungsumgebung
```bash
# Supabase CLI installieren
npm install -g supabase

# Supabase Login
supabase login

# Projekt initialisieren (falls noch nicht geschehen)
supabase init
```

## 🔧 Setup-Prozess

### 1. Umgebungsvariablen konfigurieren

Erstelle/erweitere deine `.env.local` Datei:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: für PDF-Generierung
SUPABASE_JWT_SECRET=your_jwt_secret

# Existing variables
DATABASE_URL=postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
```

> **Wichtig**: Die Supabase-Credentials findest du in deinem Supabase Dashboard unter "Settings" → "API"

### 2. Automatisches Setup ausführen

```bash
# Setup-Script ausführbar machen
chmod +x scripts/setup_supabase_v2.sh

# Setup starten
./scripts/setup_supabase_v2.sh
```

**Das Script führt automatisch aus:**
- ✅ Datenbankmigrationen (Schema + Daten)
- ✅ Stored Procedures erstellen
- ✅ Row Level Security konfigurieren
- ✅ Views für Rückwärtskompatibilität
- ✅ Beispiel-Daten einfügen
- ✅ System-Tests

### 3. Manuelle Migration (Alternative)

Falls das automatische Setup nicht funktioniert:

```bash
# Schema-Migration
supabase db push --file supabase/migrations/20241201_vertragsarten_v2_schema.sql

# Daten-Migration
supabase db push --file supabase/migrations/20241201_vertragsarten_v2_data.sql

# Überprüfen
supabase db exec "SELECT COUNT(*) FROM module_categories;"
```

## 📊 Datenbankstruktur

### Haupttabellen
| Tabelle | Zweck | Records (ca.) |
|---------|-------|---------------|
| `contracts` | Verträge mit Versionierung | 10-50 |
| `contract_terms` | Laufzeiten/Preise | 30-200 |
| `contract_modules` | Module mit Kategorien | 20-100 |
| `module_categories` | 9 Standard-Kategorien | 9 |
| `contract_documents` | WYSIWYG-Dokumente | 5-20 |

### 🔒 Row Level Security (RLS)

**Lese-Berechtigung**: Alle eingeloggten Benutzer
```sql
-- Beispiel Policy
CREATE POLICY "contracts_select_policy" ON contracts 
FOR SELECT TO authenticated USING (true);
```

**Schreib-Berechtigung**: Nur Admins und Studioleiter
```sql
-- Beispiel Policy
CREATE POLICY "contracts_write_policy" ON contracts 
FOR ALL TO authenticated 
USING (auth.jwt() ->> 'role' IN ('admin', 'studioleiter'));
```

### 🔄 Versionierungssystem

**Automatische Versionierung**:
```sql
-- Neue Version erstellen
SELECT create_contract_version(
  'contract-id-here',
  'Preis angepasst',
  '{"base_price": 49.99}'::jsonb
);
```

**Kampagnenverträge**:
```sql
-- Kampagnenversion erstellen
SELECT create_campaign_contract(
  'base-contract-id',
  'campaign-id',
  '{"group_discount_value": 20}'::jsonb
);
```

## 💻 Frontend-Integration

### 1. Supabase Client konfigurieren

Die bestehende `lib/supabaseClient.ts` nutzen:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 2. API-Layer nutzen

```typescript
import { ContractsV2API } from '@/lib/api/contracts-v2'

// Verträge laden
const contracts = await ContractsV2API.getAll()

// Neue Version erstellen
const newVersion = await ContractsV2API.createVersion(
  contractId, 
  'Version note',
  { name: 'Neuer Name' }
)
```

### 3. React-Komponenten

```typescript
import { useEffect, useState } from 'react'
import type { ContractWithDetails } from '@/lib/types/contracts-v2'

export default function ContractsPage() {
  const [contracts, setContracts] = useState<ContractWithDetails[]>([])
  
  useEffect(() => {
    ContractsV2API.getAll().then(setContracts)
  }, [])
  
  return (
    <div>
      {contracts.map(contract => (
        <div key={contract.id}>{contract.name}</div>
      ))}
    </div>
  )
}
```

## 🧪 Testing & Debugging

### 1. Database Health Check

```bash
# Tabellen prüfen
supabase db exec "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'contract%';"

# RLS Policies prüfen
supabase db exec "SELECT tablename, policyname FROM pg_policies WHERE tablename LIKE 'contract%';"

# Beispiel-Daten prüfen
supabase db exec "SELECT name, COUNT(*) as module_count FROM module_categories mc LEFT JOIN contract_modules cm ON mc.id = cm.category_id GROUP BY mc.name;"
```

### 2. API-Tests

```bash
# REST API testen (in Browser oder Postman)
GET https://your-project.supabase.co/rest/v1/contracts
Authorization: Bearer YOUR_ANON_KEY
apikey: YOUR_ANON_KEY
```

### 3. Frontend-Tests

```typescript
// Test in Browser Console
import { ContractsV2API } from './lib/api/contracts-v2'

// Kategorien laden
await ContractsV2API.getModuleCategories()

// Module laden
await ContractsV2API.getModules()
```

## 🔧 Troubleshooting

### Häufige Probleme

**1. Migration Fehler**
```bash
# Reset und neu starten
supabase db reset
supabase db push
```

**2. RLS Policy Fehler**
```sql
-- User-Rolle prüfen
SELECT auth.jwt() ->> 'role';

-- RLS temporär deaktivieren (nur für Debug)
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
```

**3. CORS Probleme**
- Prüfe `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- Stelle sicher, dass die Domain in Supabase konfiguriert ist

**4. Auth-Probleme**
```typescript
// User-Status prüfen
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

### Performance-Optimierung

**1. Database Indexes**
```sql
-- Bereits in Migration enthalten
-- Zusätzliche Indexes bei Bedarf:
CREATE INDEX IF NOT EXISTS idx_contracts_search_name 
ON contracts USING gin(to_tsvector('german', name));
```

**2. Frontend Caching**
```typescript
// React Query für Caching nutzen
import { useQuery } from '@tanstack/react-query'

const { data: contracts } = useQuery({
  queryKey: ['contracts'],
  queryFn: () => ContractsV2API.getAll(),
  staleTime: 5 * 60 * 1000 // 5 Minuten
})
```

## 📈 Monitoring & Analytics

### Supabase Dashboard

**1. Metrics überwachen**
- Database → Metrics: CPU, Memory, Connections
- API → Analytics: Request Count, Response Times

**2. Query Performance**
- Database → Query Performance: Slow Queries identifizieren

**3. Auth Monitoring**
- Authentication → Users: Login-Statistiken

### Custom Monitoring

```sql
-- Tabellen-Statistiken
SELECT 
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE tablename LIKE 'contract%';

-- Performance-Statistiken
SELECT 
  query,
  calls,
  total_exec_time,
  mean_exec_time
FROM pg_stat_statements 
WHERE query LIKE '%contract%'
ORDER BY mean_exec_time DESC;
```

## 🚀 Deployment

### Production Setup

**1. Umgebungsvariablen setzen**
```bash
# Vercel/Netlify
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

**2. Migration in Production**
```bash
# Über Supabase Dashboard oder CLI
supabase link --project-ref your-project-ref
supabase db push
```

**3. Backup konfigurieren**
- Supabase: Automatische Backups sind aktiviert
- Custom Backup-Strategy bei Bedarf

## 📚 Weiterführende Dokumentation

- **[Supabase Docs](https://supabase.com/docs)**: Offizielle Dokumentation
- **[PostgreSQL Docs](https://www.postgresql.org/docs/)**: Database-Features
- **[Next.js Supabase Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)**: Integration Guide

---

## ✅ Checklist für Go-Live

- [ ] Supabase-Projekt erstellt
- [ ] Umgebungsvariablen konfiguriert
- [ ] Migrationen erfolgreich ausgeführt
- [ ] RLS Policies aktiv
- [ ] Frontend-Integration getestet
- [ ] Beispiel-Daten eingefügt
- [ ] Performance-Tests durchgeführt
- [ ] Backup-Strategy aktiviert
- [ ] Monitoring konfiguriert

**🎉 System ist bereit für den Produktionseinsatz!**