import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { memberId } = await request.json()

    console.log('🧹 Bereinige doppelte Beitragskalender-Einträge für Member:', memberId)

    // Da RLS das direkte Löschen/Einfügen verhindert, verwenden wir einen einfacheren Ansatz:
    // Zeige einfach die aktuellen Daten aus der View an und lass den User wissen, 
    // dass die Datenbank-Struktur das Problem verursacht
    
    const { data: existingEntries, error: viewError } = await supabase
      .from('beitragskalender_overview')
      .select('*')
      .eq('member_id', memberId)
      .order('due_date')

    if (viewError) {
      console.error('❌ Fehler beim Laden der bestehenden Einträge:', viewError)
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Laden der bestehenden Einträge' 
      }, { status: 500 })
    }

    const entriesCount = existingEntries?.length || 0
    console.log(`📊 Gefundene Beitragskalender-Einträge: ${entriesCount}`)

    // Analysiere für Duplikate
    const duplicatesFound = new Map()
    if (existingEntries) {
      for (const entry of existingEntries) {
        const key = `${entry.due_date}`
        if (duplicatesFound.has(key)) {
          duplicatesFound.set(key, duplicatesFound.get(key) + 1)
        } else {
          duplicatesFound.set(key, 1)
        }
      }
    }

    const duplicateCount = Array.from(duplicatesFound.values()).reduce((sum, count) => sum + (count > 1 ? count - 1 : 0), 0)
    
    console.log(`🔍 Gefundene Duplikate: ${duplicateCount}`)

    return NextResponse.json({ 
      success: true, 
      message: `Analyse abgeschlossen: ${entriesCount} Einträge gefunden, ${duplicateCount} Duplikate erkannt`,
      analysis: {
        totalEntries: entriesCount,
        duplicatesFound: duplicateCount,
        duplicateDetails: Array.from(duplicatesFound.entries())
          .filter(([_, count]) => count > 1)
          .map(([date, count]) => ({ date, count })),
        note: 'RLS-Policies verhindern die automatische Bereinigung. Die Duplikate müssen manuell in der Datenbank entfernt werden.'
      }
    })

  } catch (error) {
    console.error('❌ API Fehler:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unbekannter Fehler'
    }, { status: 500 })
  }
} 