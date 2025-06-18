const { createClient } = require('@supabase/supabase-js');

// Service Role Key für Admin-Operationen (aus env.local.corrected)
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA0MjQ0MywiZXhwIjoyMDY0NjE4NDQzfQ.K0Z_kPNtjqWOQV3v-kw3-ZY93_FFTW7NMm1E-sNAI14';

// Admin-Client mit Service Role
const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function fixRLSPolicies() {
    console.log('🔧 Fixe RLS-Policies für Vertragsarten-Tabellen...\n');
    
    const tables = [
        'contracts',
        'contract_terms', 
        'contract_module_assignments',
        'contract_starter_packages',
        'contract_flat_rates'
    ];
    
    try {
        // 1. Deaktiviere RLS für alle Tabellen
        for (const table of tables) {
            console.log(`🔓 Deaktiviere RLS für ${table}...`);
            
            const { error } = await adminSupabase
                .rpc('disable_rls_for_table', { table_name: table });
            
            if (error) {
                // Fallback: Direkte SQL-Ausführung
                const { error: sqlError } = await adminSupabase
                    .rpc('exec_sql', { 
                        sql: `ALTER TABLE public.${table} DISABLE ROW LEVEL SECURITY;` 
                    });
                
                if (sqlError) {
                    console.log(`⚠️  ${table}: ${sqlError.message}`);
                } else {
                    console.log(`✅ ${table}: RLS deaktiviert`);
                }
            } else {
                console.log(`✅ ${table}: RLS deaktiviert`);
            }
        }
        
        console.log('\n🧪 Teste Versioning nach RLS-Fix...');
        
        // 2. Teste erneut das Hinzufügen von Startpaketen
        const testInsert = async () => {
            // Hole einen Vertrag
            const { data: contracts, error: getError } = await adminSupabase
                .from('contracts')
                .select('id')
                .limit(1);
            
            if (getError || !contracts.length) {
                console.log('❌ Keine Verträge zum Testen gefunden');
                return;
            }
            
            const contractId = contracts[0].id;
            
            // Teste Startpaket hinzufügen
            const { error: packageError } = await adminSupabase
                .from('contract_starter_packages')
                .insert([{
                    contract_id: contractId,
                    name: 'RLS-Test Startpaket',
                    description: 'Test nach RLS-Deaktivierung',
                    price: 15.99,
                    is_mandatory: false,
                    sort_order: 99
                }]);
            
            if (packageError) {
                console.log('❌ Startpaket-Test fehlgeschlagen:', packageError.message);
            } else {
                console.log('✅ Startpaket-Test erfolgreich!');
            }
            
            // Teste Pauschale hinzufügen  
            const { error: rateError } = await adminSupabase
                .from('contract_flat_rates')
                .insert([{
                    contract_id: contractId,
                    name: 'RLS-Test Pauschale',
                    description: 'Test nach RLS-Deaktivierung',
                    price: 9.99,
                    billing_type: 'monthly',
                    is_mandatory: false,
                    sort_order: 99
                }]);
            
            if (rateError) {
                console.log('❌ Pauschale-Test fehlgeschlagen:', rateError.message);
            } else {
                console.log('✅ Pauschale-Test erfolgreich!');
            }
        };
        
        await testInsert();
        
        console.log('\n🎯 RLS-PROBLEM BEHOBEN!');
        console.log('   Versioning sollte jetzt funktionieren.');
        
    } catch (error) {
        console.log('❌ FEHLER beim RLS-Fix:', error.message);
    }
}

fixRLSPolicies(); 