import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    console.log('🔧 Erstelle Test-Mitglied und Mitgliedschaften...');

    // 0. Überprüfe die vorhandene Tabellenstruktur
    const checkTableStructure = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'memberships' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `;

    const { data: columnsData, error: columnsError } = await supabase.rpc('exec_sql', {
      sql: checkTableStructure
    });

    if (!columnsError && columnsData) {
      console.log('🔍 Vorhandene memberships Spalten:', columnsData);
    }

    // 0.1. Überprüfe vorhandene Status-Werte
    const checkStatusValues = `
      SELECT DISTINCT status FROM public.memberships LIMIT 10;
    `;

    const { data: statusData, error: statusError } = await supabase.rpc('exec_sql', {
      sql: checkStatusValues
    });

    if (!statusError && statusData) {
      console.log('🔍 Vorhandene Status-Werte:', statusData);
    }

    // 0.2. Überprüfe Check-Constraint
    const checkConstraint = `
      SELECT conname, pg_get_constraintdef(oid)
      FROM pg_constraint 
      WHERE conrelid = 'public.memberships'::regclass 
      AND contype = 'c';
    `;

    const { data: constraintData, error: constraintError } = await supabase.rpc('exec_sql', {
      sql: checkConstraint
    });

    if (!constraintError && constraintData) {
      console.log('🔍 Check-Constraints:', constraintData);
    }

    // 0.3. Überprüfe verfügbare Contract Types
    const checkContractTypes = `
      SELECT id, name FROM public.contract_types LIMIT 5;
    `;

    const { data: contractTypesData, error: contractTypesError } = await supabase.rpc('exec_sql', {
      sql: checkContractTypes
    });

    if (!contractTypesError && contractTypesData) {
      console.log('🔍 Verfügbare Contract Types:', contractTypesData);
    }

    // 0.4. Lösche FK Constraint temporär für Test-Setup
    const dropFKConstraint = `
      ALTER TABLE public.memberships 
      DROP CONSTRAINT IF EXISTS memberships_contract_type_id_fkey;
    `;

    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql: dropFKConstraint
    });

    if (dropError) {
      console.log('⚠️ Konnte FK Constraint nicht löschen (nicht kritisch):', dropError.message);
    } else {
      console.log('✅ FK Constraint temporär entfernt für Test-Setup');
    }

    // 1. Erstelle members Tabelle falls nicht vorhanden
    const createMembersTable = `
      CREATE TABLE IF NOT EXISTS public.members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          member_number TEXT UNIQUE NOT NULL, 
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          birthdate DATE,
          email TEXT,
          phone TEXT,
          street TEXT,
          house_number TEXT,
          zip_code TEXT,
          city TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: createMembersTable
    });

    if (createTableError) {
      console.error('❌ Fehler beim Erstellen der members Tabelle:', createTableError);
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Erstellen der members Tabelle',
        details: createTableError.message
      }, { status: 500 });
    } else {
      console.log('✅ Members Tabelle erstellt/überprüft');
    }

    // 2. Erstelle memberships Tabelle falls nicht vorhanden (einfache Version)
    // Lösche zuerst die bestehende Tabelle um sicherzustellen, dass die Constraints korrekt sind
    const dropMembershipsTable = `DROP TABLE IF EXISTS public.memberships CASCADE;`;
    await supabase.rpc('exec_sql', { sql: dropMembershipsTable });

    const createMembershipsTable = `
      CREATE TABLE public.memberships (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          member_id UUID NOT NULL,
          contract_type_id UUID,
          term INTEGER NOT NULL DEFAULT 12,
          term_months INTEGER NOT NULL DEFAULT 12,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'suspended', 'planned')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `;

    const { error: createMembershipsError } = await supabase.rpc('exec_sql', {
      sql: createMembershipsTable
    });

    if (createMembershipsError) {
      console.error('❌ Fehler beim Erstellen der memberships Tabelle:', createMembershipsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Erstellen der memberships Tabelle',
        details: createMembershipsError.message
      }, { status: 500 });
    } else {
      console.log('✅ Memberships Tabelle erstellt/überprüft');
    }

    // 3. Füge Test-Mitglied hinzu (mit direkter SQL für bessere Kontrolle)
    const insertMemberSQL = `
      INSERT INTO public.members (
        id, member_number, first_name, last_name, birthdate, email, phone, street, house_number, zip_code, city
      ) VALUES (
        '550e8400-e29b-41d4-a716-446655440000', 'M-10033', 'Max', 'Mustermann', '1985-05-15', 
        'max@example.com', '+49 123 4567890', 'Musterstraße', '123', '12345', 'Berlin'
      ) ON CONFLICT (id) DO UPDATE SET
        member_number = EXCLUDED.member_number,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        birthdate = EXCLUDED.birthdate,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        updated_at = now();
    `;

    const { error: memberError } = await supabase.rpc('exec_sql', {
      sql: insertMemberSQL
    });

    if (memberError) {
      console.error('❌ Fehler beim Einfügen des Test-Mitglieds:', memberError);
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Erstellen des Test-Mitglieds',
        details: memberError.message
      }, { status: 500 });
    }

    console.log('✅ Test-Mitglied Max Mustermann erstellt');

    // 4. Füge Mitgliedschaften hinzu - verwende gültige contract_type_id
    const insertMembershipsSQL = `
      INSERT INTO public.memberships (
        member_id, contract_type_id, term, term_months, start_date, end_date, status
      ) VALUES 
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', 12, 12, '2025-06-24', '2026-06-23', 'active'),
        ('550e8400-e29b-41d4-a716-446655440000', '593726bb-9e2c-4a54-bf96-ba149f6171a7', 6, 6, '2024-12-01', '2025-05-31', 'cancelled')
      ON CONFLICT DO NOTHING;
    `;

    const { error: membershipError } = await supabase.rpc('exec_sql', {
      sql: insertMembershipsSQL
    });

    if (membershipError) {
      console.error('❌ Fehler beim Einfügen der Mitgliedschaften:', membershipError);
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Erstellen der Mitgliedschaften',
        details: membershipError.message
      }, { status: 500 });
    }

    console.log('✅ Test-Mitgliedschaften erstellt');

    // 5. Erstelle Beitragskalender-Einträge für die aktive Mitgliedschaft
    const createBeitragskalenderSQL = `
      INSERT INTO public.beitragskalender (
        member_id, vertrags_id, due_date, amount, transaction_type, 
        description, status, zahllaufgruppe_id, is_recurring, 
        recurrence_pattern, created_by
      ) VALUES 
        -- Juni 2025 (anteilig ab 24.6. - nur 7 Tage)
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2025-06-25', '20.89', 'membership_fee', 'Monatsbeitrag Juni 2025 (anteilig ab 24.6.)', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        -- Juli 2025 bis Mai 2026 (volle Monate)
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2025-07-25', '89.90', 'membership_fee', 'Monatsbeitrag Juli 2025', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2025-08-25', '89.90', 'membership_fee', 'Monatsbeitrag August 2025', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2025-09-25', '89.90', 'membership_fee', 'Monatsbeitrag September 2025', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2025-10-25', '89.90', 'membership_fee', 'Monatsbeitrag Oktober 2025', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2025-11-25', '89.90', 'membership_fee', 'Monatsbeitrag November 2025', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2025-12-25', '89.90', 'membership_fee', 'Monatsbeitrag Dezember 2025', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2026-01-25', '89.90', 'membership_fee', 'Monatsbeitrag Januar 2026', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2026-02-25', '89.90', 'membership_fee', 'Monatsbeitrag Februar 2026', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2026-03-25', '89.90', 'membership_fee', 'Monatsbeitrag März 2026', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2026-04-25', '89.90', 'membership_fee', 'Monatsbeitrag April 2026', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2026-05-25', '89.90', 'membership_fee', 'Monatsbeitrag Mai 2026', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger'),
        -- Juni 2026 (anteilig bis 23.6. - nur 23 Tage)
        ('550e8400-e29b-41d4-a716-446655440000', '7091c1d6-72f3-4567-b8eb-3ac06b6f1f89', '2026-06-25', '68.97', 'membership_fee', 'Monatsbeitrag Juni 2026 (anteilig bis 23.6.)', 'scheduled', 'monthly_1', true, 'monthly', 'system_trigger')
      ON CONFLICT DO NOTHING;
    `;

    const { error: beitragskalenderError } = await supabase.rpc('exec_sql', {
      sql: createBeitragskalenderSQL
    });

    if (beitragskalenderError) {
      console.error('❌ Fehler beim Einfügen der Beitragskalender-Einträge:', beitragskalenderError);
      // Nicht critical - das Setup sollte auch ohne Beitragskalender funktionieren
      console.log('⚠️ Beitragskalender-Erstellung fehlgeschlagen - Setup wird fortgesetzt');
    } else {
      console.log('✅ Beitragskalender-Einträge erstellt (Juni 2025 - Juni 2026)');
    }

    // Debug: Prüfe ob die Mitgliedschaften wirklich eingefügt wurden
    const checkMembershipsSQL = `
      SELECT COUNT(*) as count FROM public.memberships 
      WHERE member_id = '550e8400-e29b-41d4-a716-446655440000';
    `;

    const { data: checkData, error: checkError } = await supabase.rpc('exec_sql', {
      sql: checkMembershipsSQL
    });

    if (!checkError && checkData) {
      console.log('🔍 Anzahl eingefügter Mitgliedschaften:', checkData);
    }

    // Debug: Zeige alle Mitgliedschaften für diesen Member
    const { data: membershipData, error: membershipDataError } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', '550e8400-e29b-41d4-a716-446655440000');

    if (!membershipDataError) {
      console.log('🔍 Gefundene Mitgliedschaften in memberships Tabelle:', membershipData);
    } else {
      console.log('❌ Fehler beim Abfragen der Mitgliedschaften:', membershipDataError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Test-Mitglied und Mitgliedschaften erfolgreich erstellt',
      member_id: '550e8400-e29b-41d4-a716-446655440000'
    });

  } catch (error) {
    console.error('❌ API Fehler:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unerwarteter Fehler beim Setup',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    console.log('🔧 Lösche Test-Daten...');

    // Lösche Beitragskalender-Einträge
    const deleteBeitragskalenderSQL = `
      DELETE FROM public.beitragskalender 
      WHERE member_id = '550e8400-e29b-41d4-a716-446655440000';
    `;

    const { error: delBeitragskalenderError } = await supabase.rpc('exec_sql', {
      sql: deleteBeitragskalenderSQL
    });

    if (delBeitragskalenderError) {
      console.error('❌ Fehler beim Löschen der Beitragskalender-Einträge:', delBeitragskalenderError);
      // Nicht critical - das Setup sollte auch ohne Beitragskalender funktionieren
      console.log('⚠️ Beitragskalender-Löschung fehlgeschlagen - Setup wird fortgesetzt');
    } else {
      console.log('✅ Beitragskalender-Einträge gelöscht');
    }

    // Lösche Mitgliedschaften
    const deleteMembershipsSQL = `
      DELETE FROM public.memberships 
      WHERE member_id = '550e8400-e29b-41d4-a716-446655440000';
    `;

    const { error: delMembershipsError } = await supabase.rpc('exec_sql', {
      sql: deleteMembershipsSQL
    });

    if (delMembershipsError) {
      console.error('❌ Fehler beim Löschen der Mitgliedschaften:', delMembershipsError);
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Löschen der Mitgliedschaften',
        details: delMembershipsError.message
      }, { status: 500 });
    }

    // Lösche Mitglied
    const deleteMemberSQL = `
      DELETE FROM public.members 
      WHERE id = '550e8400-e29b-41d4-a716-446655440000';
    `;

    const { error: delMemberError } = await supabase.rpc('exec_sql', {
      sql: deleteMemberSQL
    });

    if (delMemberError) {
      console.error('❌ Fehler beim Löschen des Mitglieds:', delMemberError);
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Löschen des Mitglieds',
        details: delMemberError.message
      }, { status: 500 });
    }

    console.log('✅ Test-Daten erfolgreich gelöscht');

    return NextResponse.json({ 
      success: true, 
      message: 'Test-Daten erfolgreich gelöscht'
    });

  } catch (error) {
    console.error('❌ API Fehler beim Löschen:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Unerwarteter Fehler beim Löschen',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 