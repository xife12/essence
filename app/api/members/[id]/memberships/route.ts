import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const memberId = params.id

    console.log('🔧 API: Hole Mitgliedschaftsdaten für Member:', memberId)

    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('member_id', memberId)
      .order('start_date', { ascending: false })

    if (error) {
      console.error('❌ Fehler beim Laden der Mitgliedschaften:', error)
      throw error
    }

    console.log('✅ Mitgliedschaftsdaten gefunden:', memberships?.length)

    return NextResponse.json(memberships || [])

  } catch (error) {
    console.error('❌ API Fehler:', error)
    return NextResponse.json(
      { error: 'Failed to fetch membership data' },
      { status: 500 }
    )
  }
} 