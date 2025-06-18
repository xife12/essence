import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API Route: Starting getAllContracts...');
    
    // Lade alle Verträge: aktive und Kampagnenverträge
    const { data: activeContracts, error: activeError } = await supabase
      .from('contracts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
      
    const { data: campaignContracts, error: campaignError } = await supabase
      .from('contracts')
      .select('*')
      .eq('is_campaign_version', true)
      .order('created_at', { ascending: false });
      
    // Kombiniere beide Listen
    const contracts = [...(activeContracts || []), ...(campaignContracts || [])];
    const error = activeError || campaignError;

    console.log('📊 Raw contracts loaded:', contracts?.length || 0);
    
    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    // Gruppiere nach contract_group_id ABER behalte sowohl Basis- als auch Kampagnenverträge
    const contractGroups = new Map();
    const separateCampaignContracts = [];
    
    contracts?.forEach(contract => {
      if (contract.is_campaign_version) {
        // Kampagnenverträge separat sammeln
        separateCampaignContracts.push(contract);
      } else {
        // Normale Verträge gruppieren (nur neueste Version)
        const groupId = contract.contract_group_id || contract.id;
        const existing = contractGroups.get(groupId);
        
        if (!existing || (contract.version_number || 1) > (existing.version_number || 1)) {
          contractGroups.set(groupId, contract);
        }
      }
    });

    // Kombiniere normale Verträge + alle Kampagnenverträge
    const latestContracts = [...Array.from(contractGroups.values()), ...separateCampaignContracts];
    console.log('✅ Latest contracts:', latestContracts.length);

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