import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Route: Starting getAllContracts...');
    
    // 🔧 FIX: Lade alle relevanten Verträge in einem Query
    const { data: allContracts, error } = await supabase
      .from('contracts')
      .select('*')
      .or('is_active.eq.true,is_campaign_version.eq.true')
      .order('created_at', { ascending: false });

    console.log('📊 Raw contracts loaded:', allContracts?.length || 0);
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    // 🔧 FIX: Deduplication basierend auf contract ID (nicht group)
    const uniqueContracts = new Map();
    
    allContracts?.forEach(contract => {
      const contractId = contract.id;
      
      // Überspringe, wenn wir diese contract ID bereits haben
      if (uniqueContracts.has(contractId)) {
        return;
      }
      
      uniqueContracts.set(contractId, contract);
    });

    // 🔧 FIX: Für gruppierte Verträge (normale Versionen) nur die neueste behalten
    const contractGroups = new Map();
    const campaignContracts = [];
    
    Array.from(uniqueContracts.values()).forEach(contract => {
      if (contract.is_campaign_version) {
        // Kampagnenverträge direkt hinzufügen
        campaignContracts.push(contract);
      } else {
        // Normale Verträge gruppieren und nur neueste Version behalten
        const groupId = contract.contract_group_id || contract.id;
        const existing = contractGroups.get(groupId);
        
        if (!existing || (contract.version_number || 1) > (existing.version_number || 1)) {
          contractGroups.set(groupId, contract);
        }
      }
    });

    // 🔧 FIX: Kombiniere normale + Kampagnenverträge ohne Duplikate
    const latestContracts = [...Array.from(contractGroups.values()), ...campaignContracts];
    
    console.log('✅ Latest contracts (deduplicated):', latestContracts.length);
    console.log('🔍 Contract IDs:', latestContracts.map(c => c.id));

    return NextResponse.json({ 
      success: true, 
      data: latestContracts 
    });
    
  } catch (error: any) {
    console.error('❌ GET /api/contracts-v2 Fehler:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Fehler beim Laden der Verträge', data: null },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contractData = await request.json();
    console.log('📝 Creating new contract:', contractData.name);
    
    // Hier würde normalerweise contractsAPI.createContract aufgerufen
    return NextResponse.json({ 
      success: true, 
      message: 'Contract creation not implemented yet' 
    }, { status: 501 });
    
  } catch (error: any) {
    console.error('❌ POST /api/contracts-v2 Fehler:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Fehler beim Erstellen des Vertrags', data: null },
      { status: 500 }
    );
  }
} 