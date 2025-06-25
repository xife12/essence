import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const memberId = params.id

    console.log('🔧 Erstelle Beitragskalender für Member:', memberId)

    // 1. Hole die Mitgliedschaften für diesen Member
    const { data: memberships, error: membershipError } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', memberId)

    if (membershipError) {
      console.error('❌ Fehler beim Laden der Mitgliedschaften:', membershipError)
      return NextResponse.json({ 
        success: false, 
        error: 'Fehler beim Laden der Mitgliedschaften',
        details: membershipError.message 
      }, { status: 500 })
    }

    if (!memberships || memberships.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Keine Mitgliedschaften für diesen Member gefunden' 
      })
    }

    console.log('✅ Mitgliedschaften gefunden:', memberships.length)

    // Direkte Einfügung ohne Tabellenerstellung (falls Migration nicht lief)
    const beitragskalenderEntries = []

    for (const membership of memberships) {
      const startDate = new Date(membership.start_date)
      const endDate = membership.end_date ? new Date(membership.end_date) : new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate())
      const termMonths = membership.term_months || 12
      const monthlyFee = 89.90

      console.log('📊 Generiere Einträge für Mitgliedschaft:', membership.id)

      // Generiere monatliche Beiträge
      for (let i = 0; i < termMonths; i++) {
        const dueDate = new Date(startDate)
        dueDate.setMonth(startDate.getMonth() + i)
        dueDate.setDate(1)

        if (dueDate > endDate) break

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        dueDate.setHours(0, 0, 0, 0)

        let status = 'scheduled'
        if (dueDate < today) {
          status = i % 3 === 0 ? 'processed' : 'scheduled'
        }

        const entry = {
          member_id: memberId,
          vertrags_id: membership.id,
          zahllaufgruppe_id: 'default_group',
          due_date: dueDate.toISOString().split('T')[0],
          transaction_type: 'membership_fee',
          amount: monthlyFee,
          status: status,
          description: `Monatsbeitrag Premium ${dueDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
          created_by: 'auto_generator',
          is_recurring: true,
          recurrence_pattern: 'monthly',
          retry_count: 0,
          priority: 1
        }

        beitragskalenderEntries.push(entry)
      }
    }

    console.log('📝 Einträge zu erstellen:', beitragskalenderEntries.length)

    if (beitragskalenderEntries.length > 0) {
      // Lösche bestehende Einträge
      await supabase
        .from('beitragskalender')
        .delete()
        .eq('member_id', memberId)

      // Füge neue Einträge ein
      const { data: insertedEntries, error: insertError } = await supabase
        .from('beitragskalender')
        .insert(beitragskalenderEntries)
        .select()

      if (insertError) {
        console.error('❌ Fehler beim Einfügen:', insertError)
        return NextResponse.json({ 
          success: false, 
          error: 'Fehler beim Einfügen der Beitragskalender-Einträge',
          details: insertError.message
        }, { status: 500 })
      }

      console.log('✅ Beitragskalender-Einträge erstellt:', insertedEntries?.length)

      return NextResponse.json({ 
        success: true, 
        message: `${insertedEntries?.length} Beitragskalender-Einträge erfolgreich erstellt`,
        entries_created: insertedEntries?.length,
        member_id: memberId
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Keine Beitragskalender-Einträge generiert' 
      })
    }

  } catch (error) {
    console.error('❌ API Fehler:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Unerwarteter Fehler beim Erstellen des Beitragskalenders',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 