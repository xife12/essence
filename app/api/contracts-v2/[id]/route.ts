import { NextRequest, NextResponse } from 'next/server';
import contractsAPI from '../../../lib/api/contracts-v2';

// GET /api/contracts-v2/[id] - Einzelnen Vertrag laden
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    
    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID ist erforderlich' },
        { status: 400 }
      );
    }

    console.log(`🔍 API: Lade Contract Details für ID: ${contractId}`);
    
    // Verwende die erweiterte getContractDetails Methode
    const response = await contractsAPI.getContractDetails(contractId);
    
    if (response.error) {
      console.error('❌ API Error:', response.error);
      return NextResponse.json(response, { status: 404 });
    }

    console.log('✅ API Response erfolgreich:', {
      contractId,
      hasModules: response.data?.module_assignments?.length > 0,
      hasPaymentIntervals: response.data?.payment_intervals?.length > 0,
      hasPriceDynamicRules: response.data?.price_dynamic_rules?.length > 0
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('GET /api/contracts-v2/[id] Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Vertragsdetails' },
      { status: 500 }
    );
  }
}

// PUT /api/contracts-v2/[id] - Vertrag aktualisieren (Versionierung)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    const contractData = await request.json();
    
    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID ist erforderlich' },
        { status: 400 }
      );
    }

    console.log(`🔄 API: Update Contract ${contractId}`);
    console.log('📦 Update Data:', {
      hasModules: contractData.module_assignments?.length > 0,
      hasPaymentIntervals: contractData.payment_intervals?.length > 0,
      hasPriceDynamicRules: contractData.price_dynamic_rules?.length > 0
    });
    
    // Verwende die Versionierungs-basierte updateContract Methode
    const response = await contractsAPI.updateContract(contractId, contractData);
    
    if (response.error) {
      console.error('❌ Update Error:', response.error);
      return NextResponse.json(response, { status: 400 });
    }

    console.log('✅ Update erfolgreich');
    return NextResponse.json(response);
  } catch (error) {
    console.error('PUT /api/contracts-v2/[id] Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Vertrags' },
      { status: 500 }
    );
  }
}

// DELETE /api/contracts-v2/[id] - Vertrag löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contractId = params.id;
    
    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID ist erforderlich' },
        { status: 400 }
      );
    }

    const response = await contractsAPI.deleteContract(contractId);
    
    if (response.error) {
      return NextResponse.json(response, { status: 400 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('DELETE /api/contracts-v2/[id] Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Löschen des Vertrags' },
      { status: 500 }
    );
  }
} 