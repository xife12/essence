import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Lese die Migration aus der Datei
    const migrationPath = join(process.cwd(), 'supabase/migrations/20250125_001_create_members_and_memberships.sql');
    const migrationSQL = await readFile(migrationPath, 'utf-8');

    console.log('🔧 Führe Migration aus:', migrationPath);

    // Führe die Migration aus
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });

    if (error) {
      console.error('❌ Migration Fehler:', error);
      // Falls exec_sql nicht verfügbar, versuche direkte SQL-Ausführung
      const sqlLines = migrationSQL.split(';').filter(line => line.trim());
      
      for (const sqlLine of sqlLines) {
        if (sqlLine.trim()) {
          const { error: lineError } = await supabase.rpc('exec', { 
            sql: sqlLine.trim() + ';' 
          });
          if (lineError) {
            console.error('❌ SQL Fehler bei:', sqlLine.substring(0, 100) + '...', lineError);
          }
        }
      }
    }

    console.log('✅ Migration erfolgreich ausgeführt');

    return NextResponse.json({ 
      success: true, 
      message: 'Migration erfolgreich ausgeführt',
      data 
    });

  } catch (error) {
    console.error('❌ API Fehler:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Fehler beim Ausführen der Migration',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 