// Test-Script für Contract Module Assignments
const { createClient } = require('@supabase/supabase-js');

// Supabase Client Setup
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testModuleAssignmentSaving() {
  console.log('🧪 Test: Contract Module Assignments speichern');
  console.log('='.repeat(50));

  try {
    // 1. Hole einen bestehenden Contract
    const { data: contracts, error: contractError } = await supabase
      .from('contracts')
      .select('id, name')
      .eq('is_active', true)
      .limit(1);

    if (contractError) throw contractError;
    if (!contracts || contracts.length === 0) {
      throw new Error('Keine aktiven Verträge gefunden');
    }

    const testContract = contracts[0];
    console.log('✅ Test-Contract gefunden:', {
      id: testContract.id,
      name: testContract.name
    });

    // 2. Hole verfügbare Module
    const { data: modules, error: moduleError } = await supabase
      .from('contract_modules')
      .select('id, name, price_per_month')
      .eq('is_active', true)
      .limit(3);

    if (moduleError) throw moduleError;
    if (!modules || modules.length === 0) {
      throw new Error('Keine aktiven Module gefunden');
    }

    console.log('✅ Test-Module gefunden:', modules.map(m => ({ id: m.id, name: m.name })));

    // 3. Erstelle Test Module Assignments (mit gen_random_uuid())
    const testAssignments = [
      {
        contract_id: testContract.id,
        module_id: modules[0].id,
        assignment_type: 'included',
        custom_price: null,
        created_at: new Date().toISOString()
      },
      {
        contract_id: testContract.id,
        module_id: modules[1].id,
        assignment_type: 'bookable',
        custom_price: 25.00,
        created_at: new Date().toISOString()
      }
    ];

    console.log('🔄 Teste INSERT von Module Assignments...');

    // 4. INSERT ausführen
    const { data: insertResult, error: insertError } = await supabase
      .from('contract_module_assignments')
      .insert(testAssignments)
      .select();

    if (insertError) {
      console.error('❌ INSERT Fehler:', insertError);
      return;
    }

    console.log('✅ Module Assignments erfolgreich gespeichert:', insertResult.length);

    // 5. Validiere Speicherung durch SELECT
    const { data: savedAssignments, error: selectError } = await supabase
      .from('contract_module_assignments')
      .select(`
        id,
        contract_id,
        module_id,
        assignment_type,
        custom_price,
        contract_modules!inner(name, price_per_month)
      `)
      .eq('contract_id', testContract.id);

    if (selectError) {
      console.error('❌ SELECT Fehler:', selectError);
      return;
    }

    console.log('✅ Gespeicherte Assignments validiert:');
    savedAssignments.forEach(assignment => {
      console.log(`  - ${assignment.contract_modules.name}: ${assignment.assignment_type} (${assignment.custom_price || 'Standard-Preis'}€)`);
    });

    // 6. Cleanup - lösche Test-Assignments
    const { error: deleteError } = await supabase
      .from('contract_module_assignments')
      .delete()
      .in('id', insertResult.map(a => a.id));

    if (deleteError) {
      console.error('⚠️ Cleanup-Fehler:', deleteError);
    } else {
      console.log('🧹 Test-Daten erfolgreich gelöscht');
    }

    console.log('\n🎉 TEST ERFOLGREICH: Module Assignments können gespeichert werden!');

  } catch (error) {
    console.error('❌ TEST FEHLGESCHLAGEN:', error);
  }
}

// Test ausführen
testModuleAssignmentSaving(); 