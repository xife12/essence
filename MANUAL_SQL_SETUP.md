# 🗄️ Manuelle SQL-Migration für Vertragsarten V2

Da die Supabase CLI nicht installiert ist, kannst du die Migration direkt im **Supabase Dashboard** ausführen.

## 🚀 Sofort-Setup ohne CLI

### 1. Öffne Supabase SQL Editor
```
1. Gehe zu: https://app.supabase.com/project/[DEIN_PROJECT_ID]/sql
2. Klicke auf "New Query"
```

### 2. Schema Migration ausführen
Kopiere den kompletten Inhalt von `supabase/migrations/20241201_vertragsarten_v2_schema.sql` und führe ihn aus:

```sql
-- Migration: Vertragsarten-System V2 für Supabase
-- Datum: 2024-12-01
-- Beschreibung: Komplette Datenbankstruktur für das neue Vertragsarten-System

-- ============================================================================
-- SCHEMA SETUP
-- ============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- HAUPTTABELLEN
-- ============================================================================

-- 1. CONTRACTS (Haupt-Verträge mit Versionierung)
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Versionierungs-System
    contract_group_id UUID NOT NULL,
    version_number INTEGER NOT NULL DEFAULT 1,
    version_note TEXT,
    is_active BOOLEAN DEFAULT false,
    created_from_version_id UUID REFERENCES public.contracts(id),
    
    -- Basis-Informationen
    name TEXT NOT NULL,
    description TEXT,
    
    -- Kampagnen-System
    is_campaign_version BOOLEAN DEFAULT false,
    campaign_id UUID REFERENCES public.campaigns(id),
    campaign_extension_date DATE,
    base_version_id UUID REFERENCES public.contracts(id),
    auto_reactivate_version_id UUID REFERENCES public.contracts(id),
    
    -- Vertragsbedingungen
    auto_renew BOOLEAN DEFAULT false,
    renewal_term_months INTEGER,
    cancellation_period INTEGER DEFAULT 30,
    cancellation_unit TEXT DEFAULT 'days',
    
    -- Rabatte
    group_discount_enabled BOOLEAN DEFAULT false,
    group_discount_type TEXT,
    group_discount_value DECIMAL(10,2),
    
    -- Zahlungseinstellungen
    payment_runs TEXT,
    payment_methods TEXT[],
    
    -- Metadaten
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    UNIQUE(contract_group_id, version_number),
    CHECK (version_number > 0),
    CHECK (cancellation_period > 0),
    CHECK (group_discount_type IN ('percent', 'fixed') OR group_discount_type IS NULL),
    CHECK (cancellation_unit IN ('days', 'months'))
);
```

### 3. Standard-Daten einfügen
Nach dem Schema führe die Daten-Migration aus:

```sql
-- Standard-Kategorien einfügen
INSERT INTO public.module_categories (name, description, icon, color, sort_order) VALUES
('Training & Kurse', 'Gruppenkurse, Personaltraining, Workshops', 'Dumbbell', 'blue', 1),
('Wellness & Regeneration', 'Sauna, Massage, Entspannungsangebote', 'Waves', 'teal', 2),
('Gesundheit & Diagnostik', 'Gesundheitschecks, Körperanalyse', 'Heart', 'red', 3),
('Premium & Komfort', 'VIP-Bereiche, bevorzugte Behandlung', 'Crown', 'yellow', 4),
('Familie & Kinder', 'Kinderbetreuung, Familienkurse', 'Baby', 'pink', 5),
('Digital & App-Funktionen', 'Apps, Online-Content, Tracking', 'Smartphone', 'purple', 6),
('Community & Events', 'Veranstaltungen, Mitglieder-Events', 'Users', 'green', 7),
('Zugang & Infrastruktur', '24/7-Zugang, Parkplatz, Duschen', 'Building', 'gray', 8),
('Ernährung & Coaching', 'Ernährungsberatung, Lifestyle-Coaching', 'Apple', 'orange', 9)
ON CONFLICT (name) DO NOTHING;
```

### 4. System testen
Nach der Migration teste das System:

```sql
-- Test 1: Kategorien prüfen
SELECT COUNT(*) as kategorien_anzahl FROM module_categories;

-- Test 2: Tabellen prüfen
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'contract%';

-- Test 3: RLS Policies prüfen
SELECT tablename, policyname FROM pg_policies 
WHERE tablename LIKE 'contract%';
```

## ✅ Erwartete Ergebnisse:

**Test 1:** Sollte `9` zurückgeben (Kategorien)
**Test 2:** Sollte 11 Tabellen zeigen (`contracts`, `contract_terms`, etc.)
**Test 3:** Sollte mehrere RLS Policies zeigen

## 🎯 Nach der Migration

Das System ist sofort testbar unter:
- **Hauptübersicht**: http://localhost:3000/vertragsarten-v2
- **Neuer Vertrag**: http://localhost:3000/vertragsarten-v2/contracts/neu
- **Neue Module**: http://localhost:3000/vertragsarten-v2/modules/neu

## 🛠️ Troubleshooting

**Fehler: "relation already exists"**
→ Normal, manche Tabellen existieren bereits

**Fehler: "permission denied"**
→ Nutze den Service Role Key anstelle des Anon Keys

**Fehler: "foreign key constraint"**
→ Führe die Schema-Migration vor der Daten-Migration aus

## 📋 Komplette SQL-Dateien

Die vollständigen SQL-Migrationen findest du hier:
- `supabase/migrations/20241201_vertragsarten_v2_schema.sql`
- `supabase/migrations/20241201_vertragsarten_v2_data.sql`

**Kopiere sie komplett in den Supabase SQL Editor!**