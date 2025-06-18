const { createClient } = require('@supabase/supabase-js');

// Supabase-Verbindung
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU';

const supabase = createClient(supabaseUrl, supabaseKey);

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function testVersioningFlow() {
    console.log('🧪 Teste Versioning-Workflow...\n');
    
    try {
        // 1. Hole einen bestehenden Vertrag
        const { data: contracts, error: getError } = await supabase
            .from('contracts')
            .select('*')
            .limit(1);
        
        if (getError) throw getError;
        if (!contracts || contracts.length === 0) {
            console.log('❌ Keine Verträge gefunden');
            return;
        }
        
        const originalContract = contracts[0];
        console.log('✅ Original-Vertrag geladen:');
        console.log(`   ID: ${originalContract.id}`);
        console.log(`   Name: ${originalContract.name}`);
        console.log(`   Version: ${originalContract.version_number}`);
        console.log(`   Contract Group ID: ${originalContract.contract_group_id}`);
        
        // 2. Erstelle neue Version (simuliere updateContract)
        const contractGroupId = originalContract.contract_group_id || originalContract.id;
        const newVersionNumber = (originalContract.version_number || 1) + 1;
        
        const newContractData = {
            ...originalContract,
            id: generateUUID(),
            name: originalContract.name + ' (Bearbeitet)',
            contract_group_id: contractGroupId,
            version_number: newVersionNumber,
            version_note: 'Test-Versioning-Update',
            is_active: true,
            created_from_version_id: originalContract.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // 3. Deaktiviere alte Version
        const { error: deactivateError } = await supabase
            .from('contracts')
            .update({ is_active: false })
            .eq('contract_group_id', contractGroupId)
            .eq('is_active', true);
        
        if (deactivateError) throw deactivateError;
        console.log('✅ Alte Versionen deaktiviert');
        
        // 4. Erstelle neue Version
        const { data: newContract, error: createError } = await supabase
            .from('contracts')
            .insert([newContractData])
            .select()
            .single();
        
        if (createError) throw createError;
        console.log('✅ Neue Version erstellt:');
        console.log(`   ID: ${newContract.id}`);
        console.log(`   Name: ${newContract.name}`);
        console.log(`   Version: ${newContract.version_number}`);
        
        // 5. Kopiere contract_terms
        const { data: oldTerms, error: getTermsError } = await supabase
            .from('contract_terms')
            .select('*')
            .eq('contract_id', originalContract.id);
        
        if (getTermsError) throw getTermsError;
        
        if (oldTerms && oldTerms.length > 0) {
            const newTerms = oldTerms.map(term => ({
                id: generateUUID(),
                contract_id: newContract.id,
                duration_months: term.duration_months,
                base_price: term.base_price,
                sort_order: term.sort_order,
                created_at: new Date().toISOString()
            }));
            
            const { error: termsError } = await supabase
                .from('contract_terms')
                .insert(newTerms);
            
            if (termsError) throw termsError;
            console.log(`✅ ${newTerms.length} Laufzeiten kopiert`);
        }
        
        // 6. Kopiere Module-Assignments
        const { data: oldModules, error: getModulesError } = await supabase
            .from('contract_module_assignments')
            .select('*')
            .eq('contract_id', originalContract.id);
        
        if (getModulesError) throw getModulesError;
        
        if (oldModules && oldModules.length > 0) {
            const newModules = oldModules.map(module => ({
                id: generateUUID(),
                contract_id: newContract.id,
                module_id: module.module_id,
                assignment_type: module.assignment_type,
                custom_price: module.custom_price,
                created_at: new Date().toISOString()
            }));
            
            const { error: modulesError } = await supabase
                .from('contract_module_assignments')
                .insert(newModules);
            
            if (modulesError) throw modulesError;
            console.log(`✅ ${newModules.length} Module-Zuordnungen kopiert`);
        }
        
        // 7. Teste: Hinzufügen von Startpaketen
        const testStarterPackage = {
            id: generateUUID(),
            contract_id: newContract.id,
            name: 'Test Startpaket',
            description: 'Automatisch hinzugefügtes Test-Startpaket',
            price: 29.99,
            is_mandatory: false,
            sort_order: 1,
            created_at: new Date().toISOString()
        };
        
        const { error: packageError } = await supabase
            .from('contract_starter_packages')
            .insert([testStarterPackage]);
        
        if (packageError) throw packageError;
        console.log('✅ Test-Startpaket hinzugefügt');
        
        // 8. Teste: Hinzufügen von Pauschalen
        const testFlatRate = {
            id: generateUUID(),
            contract_id: newContract.id,
            name: 'Test Pauschale',
            description: 'Automatisch hinzugefügte Test-Pauschale',
            price: 19.99,
            billing_type: 'monthly',
            is_mandatory: false,
            sort_order: 1,
            created_at: new Date().toISOString()
        };
        
        const { error: rateError } = await supabase
            .from('contract_flat_rates')
            .insert([testFlatRate]);
        
        if (rateError) throw rateError;
        console.log('✅ Test-Pauschale hinzugefügt');
        
        // 9. Finale Verifikation: Lade komplett neue Version
        const { data: finalContract, error: finalError } = await supabase
            .from('contracts')
            .select(`
                *,
                contract_terms:contract_terms(*),
                module_assignments:contract_module_assignments(*),
                starter_packages:contract_starter_packages(*),
                flat_rates:contract_flat_rates(*)
            `)
            .eq('id', newContract.id)
            .single();
        
        if (finalError) throw finalError;
        
        console.log('\n🎯 FINALE VERIFIKATION:');
        console.log(`   Contract ID: ${finalContract.id}`);
        console.log(`   Name: ${finalContract.name}`);
        console.log(`   Version: ${finalContract.version_number}`);
        console.log(`   Laufzeiten: ${finalContract.contract_terms?.length || 0}`);
        console.log(`   Module: ${finalContract.module_assignments?.length || 0}`);
        console.log(`   Startpakete: ${finalContract.starter_packages?.length || 0}`);
        console.log(`   Pauschalen: ${finalContract.flat_rates?.length || 0}`);
        
        console.log('\n✅ VERSIONING-WORKFLOW ERFOLGREICH!');
        console.log('   Die Datenbank funktioniert korrekt für Versioning.');
        console.log('   Problem liegt im Frontend/API-Code!');
        
    } catch (error) {
        console.log('❌ FEHLER im Versioning-Workflow:');
        console.log('   ', error.message);
    }
}

testVersioningFlow(); 