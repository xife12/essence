-- Migration: Erstelle Members und Memberships Tabellen
-- Datum: 2025-01-25
-- Beschreibung: Erstelle die Basis-Tabellen für Mitglieder und deren Mitgliedschaften

-- ============================================================================
-- MEMBERS (Mitglieder-Stammdaten)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_number TEXT UNIQUE NOT NULL, 
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    
    -- Personal
    birthdate DATE,
    
    -- Kontakt
    email TEXT,
    phone TEXT,
    
    -- Adresse
    street TEXT,
    house_number TEXT,
    zip_code TEXT,
    city TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- MEMBERSHIPS (Mitgliedschaften)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES public.contracts(id),
    
    -- Laufzeit
    term_months INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'suspended', 'planned')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- INDIZES
-- ============================================================================
CREATE INDEX idx_members_number ON public.members(member_number);
CREATE INDEX idx_members_name ON public.members(first_name, last_name);
CREATE INDEX idx_memberships_member ON public.memberships(member_id);
CREATE INDEX idx_memberships_status ON public.memberships(status);
CREATE INDEX idx_memberships_dates ON public.memberships(start_date, end_date);

-- ============================================================================
-- TRIGGER FÜR UPDATED_AT
-- ============================================================================
CREATE TRIGGER update_members_updated_at 
    BEFORE UPDATE ON public.members 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_memberships_updated_at 
    BEFORE UPDATE ON public.memberships 
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- TESTDATEN EINFÜGEN
-- ============================================================================

-- 1. Test-Mitglied Max Mustermann mit der ID aus dem Code
INSERT INTO public.members (
    id,
    member_number,
    first_name,
    last_name,
    birthdate,
    email,
    phone,
    street,
    house_number,
    zip_code,
    city
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'M-10033',
    'Max',
    'Mustermann',
    '1985-05-15',
    'max@example.com',
    '+49 123 4567890',
    'Musterstraße',
    '123',
    '12345',
    'Berlin'
) ON CONFLICT (id) DO UPDATE SET
    member_number = EXCLUDED.member_number,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    birthdate = EXCLUDED.birthdate,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    street = EXCLUDED.street,
    house_number = EXCLUDED.house_number,
    zip_code = EXCLUDED.zip_code,
    city = EXCLUDED.city;

-- 2. Mitgliedschaft für Max Mustermann mit Premium-Vertrag
-- Verwende eine existierende Contract-ID aus der contract_types view
INSERT INTO public.memberships (
    id,
    member_id,
    contract_id,
    term_months,
    start_date,
    end_date,
    status
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', -- Premium Contract ID
    12,
    '2024-06-24', -- Original Vertragsstartdatum
    '2025-06-23',
    'active'
) ON CONFLICT DO NOTHING;

-- 3. Zusätzliche Test-Mitgliedschaft (für Historie)
INSERT INTO public.memberships (
    id,
    member_id,
    contract_id,
    term_months,
    start_date,
    end_date,
    status
) VALUES (
    gen_random_uuid(),
    '550e8400-e29b-41d4-a716-446655440000',
    '593726bb-9e2c-4a54-bf96-ba149f6171a7', -- Standard Contract ID
    6,
    '2024-01-01',
    '2024-06-30',
    'completed'
) ON CONFLICT DO NOTHING;

-- Bestätigung
DO $$
BEGIN
    RAISE NOTICE 'Migration 20250125_001 erfolgreich: Members und Memberships Tabellen erstellt';
    RAISE NOTICE 'Test-Mitglied Max Mustermann (ID: 550e8400-e29b-41d4-a716-446655440000) hinzugefügt';
    RAISE NOTICE 'Aktive Premium-Mitgliedschaft ab 24.06.2024 erstellt';
END $$; 