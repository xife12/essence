import { NextRequest, NextResponse } from 'next/server';

interface BeitragskalenderGenerationRequest {
  member_id: string;
  start_date: string;
  end_date?: string;
  membership_fee: number;
  payment_interval: 'monthly' | 'quarterly' | 'yearly';
  payment_day?: number;
  setup_fee?: number;
  administration_fee?: number;
  key_card_fee?: number;
  contract_tariff?: string;
  source?: string;
}

interface BeitragskalenderEntry {
  member_id: string;
  due_date: string;
  transaction_type: 'membership_fee' | 'pauschale' | 'sonderumlage' | 'adjustment';
  amount: number;
  status: 'scheduled' | 'overdue' | 'paid' | 'cancelled';
  created_by: string;
  description?: string;
  audit_trail?: any;
}

export async function POST(request: NextRequest) {
  try {
    const requestData: BeitragskalenderGenerationRequest = await request.json();
    
    console.log('🗓️ Generating Beitragskalender for member:', requestData.member_id);
    
    // Validate required fields
    if (!requestData.member_id || !requestData.start_date || !requestData.membership_fee) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: member_id, start_date, membership_fee'
      }, { status: 400 });
    }

    const entries: BeitragskalenderEntry[] = [];
    const startDate = new Date(requestData.start_date);
    const endDate = requestData.end_date ? new Date(requestData.end_date) : 
                    new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate());

    // Calculate number of entries based on payment interval
    const monthsBetween = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (endDate.getMonth() - startDate.getMonth());
    
    let paymentCount = 0;
    switch (requestData.payment_interval) {
      case 'monthly':
        paymentCount = monthsBetween;
        break;
      case 'quarterly':
        paymentCount = Math.ceil(monthsBetween / 3);
        break;
      case 'yearly':
        paymentCount = Math.ceil(monthsBetween / 12);
        break;
    }

    // Generate main membership fee entries
    for (let i = 0; i < paymentCount; i++) {
      const dueDate = new Date(startDate);
      
      switch (requestData.payment_interval) {
        case 'monthly':
          dueDate.setMonth(startDate.getMonth() + i);
          break;
        case 'quarterly':
          dueDate.setMonth(startDate.getMonth() + (i * 3));
          break;
        case 'yearly':
          dueDate.setFullYear(startDate.getFullYear() + i);
          break;
      }

      // Set specific payment day if provided
      if (requestData.payment_day && requestData.payment_day >= 1 && requestData.payment_day <= 28) {
        dueDate.setDate(requestData.payment_day);
      }

      // Don't add entries beyond end date
      if (dueDate > endDate) break;

      const entry: BeitragskalenderEntry = {
        member_id: requestData.member_id,
        due_date: dueDate.toISOString().split('T')[0],
        transaction_type: 'membership_fee',
        amount: requestData.membership_fee,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: `${requestData.contract_tariff || 'Mitgliedsbeitrag'} - ${dueDate.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`,
        audit_trail: {
          source: requestData.source || 'api_generation',
          contract_data: {
            tariff: requestData.contract_tariff,
            original_start_date: requestData.start_date,
            payment_interval: requestData.payment_interval,
            payment_day: requestData.payment_day
          },
          generated_at: new Date().toISOString()
        }
      };

      entries.push(entry);
    }

    // Add setup fee if present (always first)
    if (requestData.setup_fee && requestData.setup_fee > 0) {
      const setupEntry: BeitragskalenderEntry = {
        member_id: requestData.member_id,
        due_date: startDate.toISOString().split('T')[0],
        transaction_type: 'pauschale',
        amount: requestData.setup_fee,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: 'Aufnahmegebühr',
        audit_trail: {
          source: requestData.source || 'api_generation',
          fee_type: 'setup_fee',
          generated_at: new Date().toISOString()
        }
      };
      
      entries.unshift(setupEntry); // Add at beginning
    }

    // Add administration fee if present
    if (requestData.administration_fee && requestData.administration_fee > 0) {
      const adminEntry: BeitragskalenderEntry = {
        member_id: requestData.member_id,
        due_date: startDate.toISOString().split('T')[0],
        transaction_type: 'pauschale',
        amount: requestData.administration_fee,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: 'Verwaltungsgebühr',
        audit_trail: {
          source: requestData.source || 'api_generation',
          fee_type: 'administration_fee',
          generated_at: new Date().toISOString()
        }
      };
      
      // Insert after setup fee if it exists, otherwise at beginning
      const insertIndex = requestData.setup_fee ? 1 : 0;
      entries.splice(insertIndex, 0, adminEntry);
    }

    // Add key card fee if present
    if (requestData.key_card_fee && requestData.key_card_fee > 0) {
      const keyCardEntry: BeitragskalenderEntry = {
        member_id: requestData.member_id,
        due_date: startDate.toISOString().split('T')[0],
        transaction_type: 'pauschale',
        amount: requestData.key_card_fee,
        status: 'scheduled',
        created_by: 'auto_generator',
        description: 'Kartengebühr / Chip',
        audit_trail: {
          source: requestData.source || 'api_generation',
          fee_type: 'key_card_fee',
          generated_at: new Date().toISOString()
        }
      };
      
      entries.push(keyCardEntry);
    }

    // TODO: Here we would integrate with MCP Supabase to actually store the entries
    // For now, we'll return the generated entries
    console.log(`✅ Generated ${entries.length} Beitragskalender entries for member ${requestData.member_id}`);

    return NextResponse.json({
      success: true,
      data: entries,
      message: `Generated ${entries.length} Beitragskalender entries`,
      summary: {
        member_id: requestData.member_id,
        total_entries: entries.length,
        membership_fees: entries.filter(e => e.transaction_type === 'membership_fee').length,
        one_time_fees: entries.filter(e => e.transaction_type === 'pauschale').length,
        total_amount: entries.reduce((sum, entry) => sum + entry.amount, 0),
        date_range: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        payment_interval: requestData.payment_interval
      }
    });

  } catch (error) {
    console.error('Beitragskalender generation error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
      message: 'Failed to generate Beitragskalender'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: false,
    error: 'Method not allowed',
    message: 'Use POST to generate Beitragskalender'
  }, { status: 405 });
} 