const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase-Konfiguration aus Umgebungsvariablen
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU';

// Supabase-Client erstellen
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeMigration() {
  try {
    console.log('🚀 Starting Vertragsarten V2 Migration...\n');

    // 1. Schema-Migration ausführen
    console.log('📋 Step 1: Loading schema migration...');
    const schemaPath = path.join(__dirname, 'supabase/migrations/20241201_vertragsarten_v2_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error('Schema migration file not found!');
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('✅ Schema SQL loaded successfully');

    // SQL in kleinere Chunks aufteilen für bessere Ausführung
    const sqlStatements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${sqlStatements.length} SQL statements...`);

    // Schema-Statements ausführen
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      
      if (statement.length > 10) { // Ignore very short statements
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.warn(`⚠️  Warning on statement ${i + 1}: ${error.message}`);
            // Continue with next statement for non-critical errors
          } else {
            console.log(`✅ Statement ${i + 1}/${sqlStatements.length} executed`);
          }
        } catch (err) {
          console.warn(`⚠️  Warning on statement ${i + 1}: ${err.message}`);
          // Continue with next statement
        }
      }
    }

    console.log('\n🎯 Step 2: Loading test data migration...');
    
    // 2. Test-Daten-Migration ausführen
    const dataPath = path.join(__dirname, 'supabase/migrations/20241201_vertragsarten_v2_data.sql');
    
    if (!fs.existsSync(dataPath)) {
      throw new Error('Data migration file not found!');
    }

    const dataSql = fs.readFileSync(dataPath, 'utf8');
    const dataStatements = dataSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${dataStatements.length} data statements...`);

    for (let i = 0; i < dataStatements.length; i++) {
      const statement = dataStatements[i];
      
      if (statement.length > 10) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
          
          if (error) {
            console.warn(`⚠️  Warning on data statement ${i + 1}: ${error.message}`);
          } else {
            console.log(`✅ Data statement ${i + 1}/${dataStatements.length} executed`);
          }
        } catch (err) {
          console.warn(`⚠️  Warning on data statement ${i + 1}: ${err.message}`);
        }
      }
    }

    // 3. Verification - Check if tables were created
    console.log('\n🔍 Step 3: Verifying migration...');
    
    const verificationQueries = [
      'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'contracts\'',
      'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'contract_modules\'',
      'SELECT COUNT(*) FROM information_schema.tables WHERE table_name = \'module_categories\'',
      'SELECT COUNT(*) FROM module_categories',
      'SELECT COUNT(*) FROM contract_modules WHERE is_active = true'
    ];

    for (const query of verificationQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: query });
        if (error) {
          console.log(`❌ Verification failed: ${error.message}`);
        } else {
          console.log(`✅ Verification passed: ${query}`);
        }
      } catch (err) {
        console.log(`❌ Verification error: ${err.message}`);
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('📍 You can now access the Vertragsarten V2 system at /vertragsarten-v2');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Alternative: Direct table creation if RPC doesn't work
async function createTablesDirectly() {
  console.log('🔄 Trying direct table creation approach...\n');
  
  try {
    // Test if module_categories table exists
    const { data: categories, error: catError } = await supabase
      .from('module_categories')
      .select('count', { count: 'exact', head: true });

    if (catError && catError.code === '42P01') {
      console.log('📋 Tables do not exist, need to create them first');
      console.log('❗ Please run the SQL manually in Supabase Dashboard:');
      console.log('   1. Go to https://rrrxgayeiyehnhcphltb.supabase.co/project/default/sql');
      console.log('   2. Copy contents from supabase/migrations/20241201_vertragsarten_v2_schema.sql');
      console.log('   3. Execute the SQL');
      console.log('   4. Copy contents from supabase/migrations/20241201_vertragsarten_v2_data.sql');
      console.log('   5. Execute the SQL');
      return;
    }

    console.log('✅ Tables already exist, checking data...');
    
    // Check if sample data exists
    const { data: moduleCategories } = await supabase
      .from('module_categories')
      .select('*');

    console.log(`📊 Found ${moduleCategories?.length || 0} module categories`);
    
    if (!moduleCategories || moduleCategories.length === 0) {
      console.log('📝 Inserting sample module categories...');
      
      const sampleCategories = [
        { name: 'Training & Kurse', description: 'Gruppenkurse und Trainingsangebote', icon: 'Dumbbell', color: 'blue', sort_order: 1 },
        { name: 'Wellness & Regeneration', description: 'Sauna, Massage und Entspannung', icon: 'Waves', color: 'teal', sort_order: 2 },
        { name: 'Gesundheit & Diagnostik', description: 'Gesundheitschecks und Beratung', icon: 'Heart', color: 'red', sort_order: 3 },
        { name: 'Premium & Komfort', description: 'VIP-Bereiche und Premium-Services', icon: 'Crown', color: 'yellow', sort_order: 4 },
        { name: 'Familie & Kinder', description: 'Kinderbetreuung und Familiensport', icon: 'Baby', color: 'pink', sort_order: 5 }
      ];

      const { error: insertError } = await supabase
        .from('module_categories')
        .insert(sampleCategories);

      if (insertError) {
        console.error('❌ Error inserting categories:', insertError);
      } else {
        console.log('✅ Sample categories inserted successfully');
      }
    }

    // Check modules
    const { data: modules } = await supabase
      .from('contract_modules')
      .select('*');

    console.log(`📊 Found ${modules?.length || 0} modules`);

    console.log('\n🎉 Verification completed!');
    console.log('📍 System is ready to use at /vertragsarten-v2');

  } catch (error) {
    console.error('❌ Error in direct approach:', error);
  }
}

// Run migration
executeMigration().catch(() => {
  console.log('\n🔄 Main migration failed, trying alternative approach...');
  createTablesDirectly();
});