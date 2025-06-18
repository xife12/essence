const { createClient } = require('@supabase/supabase-js');

// Supabase-Verbindung
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
    console.log('🔍 Prüfe Datenbank-Struktur...\n');
    
    // 1. Prüfe contracts Tabelle
    try {
        const { data: contracts, error: contractsError } = await supabase
            .from('contracts')
            .select('id, name, version_number, contract_group_id')
            .limit(5);
        
        if (contractsError) {
            console.log('❌ contracts Tabelle: FEHLER');
            console.log('   Error:', contractsError.message);
        } else {
            console.log('✅ contracts Tabelle: OK');
            console.log(`   Anzahl Test-Einträge: ${contracts?.length || 0}`);
            if (contracts && contracts.length > 0) {
                console.log('   Beispiel:', contracts[0]);
            }
        }
    } catch (error) {
        console.log('❌ contracts Tabelle: FEHLER', error.message);
    }
    
    console.log('');
    
    // 2. Prüfe contract_terms Tabelle
    try {
        const { data: terms, error: termsError } = await supabase
            .from('contract_terms')
            .select('*')
            .limit(3);
        
        if (termsError) {
            console.log('❌ contract_terms Tabelle: FEHLER');
            console.log('   Error:', termsError.message);
        } else {
            console.log('✅ contract_terms Tabelle: OK');
            console.log(`   Anzahl Test-Einträge: ${terms?.length || 0}`);
        }
    } catch (error) {
        console.log('❌ contract_terms Tabelle: FEHLER', error.message);
    }
    
    console.log('');
    
    // 3. Prüfe contract_module_assignments Tabelle
    try {
        const { data: modules, error: modulesError } = await supabase
            .from('contract_module_assignments')
            .select('*')
            .limit(3);
        
        if (modulesError) {
            console.log('❌ contract_module_assignments Tabelle: FEHLER');
            console.log('   Error:', modulesError.message);
        } else {
            console.log('✅ contract_module_assignments Tabelle: OK');
            console.log(`   Anzahl Test-Einträge: ${modules?.length || 0}`);
        }
    } catch (error) {
        console.log('❌ contract_module_assignments Tabelle: FEHLER', error.message);
    }
    
    console.log('');
    
    // 4. Prüfe contract_starter_packages Tabelle
    try {
        const { data: packages, error: packagesError } = await supabase
            .from('contract_starter_packages')
            .select('*')
            .limit(3);
        
        if (packagesError) {
            console.log('❌ contract_starter_packages Tabelle: FEHLER');
            console.log('   Error:', packagesError.message);
        } else {
            console.log('✅ contract_starter_packages Tabelle: OK');
            console.log(`   Anzahl Test-Einträge: ${packages?.length || 0}`);
        }
    } catch (error) {
        console.log('❌ contract_starter_packages Tabelle: FEHLER', error.message);
    }
    
    console.log('');
    
    // 5. Prüfe contract_flat_rates Tabelle
    try {
        const { data: rates, error: ratesError } = await supabase
            .from('contract_flat_rates')
            .select('*')
            .limit(3);
        
        if (ratesError) {
            console.log('❌ contract_flat_rates Tabelle: FEHLER');
            console.log('   Error:', ratesError.message);
        } else {
            console.log('✅ contract_flat_rates Tabelle: OK');
            console.log(`   Anzahl Test-Einträge: ${rates?.length || 0}`);
        }
    } catch (error) {
        console.log('❌ contract_flat_rates Tabelle: FEHLER', error.message);
    }
    
    console.log('\n🏁 Datenbank-Check abgeschlossen!');
}

checkDatabase(); 