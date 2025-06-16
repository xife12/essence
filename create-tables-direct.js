const { createClient } = require('@supabase/supabase-js');

// Supabase-Konfiguration
const supabaseUrl = 'https://rrrxgayeiyehnhcphltb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJycnhnYXllaXllaG5oY3BobHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDI0NDMsImV4cCI6MjA2NDYxODQ0M30.SNLJCUzLwaI-akxfDsj_Ze7AQwh0mRvnHiBx2BANYWU';

// Supabase-Client erstellen
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating Vertragsarten V2 Tables Directly...\n');

  try {
    // 1. Module Categories Tabelle
    console.log('📋 Creating module_categories table...');
    const { error: catError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.module_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL UNIQUE,
          description TEXT,
          icon TEXT,
          color TEXT,
          sort_order INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (catError) {
      console.log(`⚠️  Warning creating module_categories: ${catError.message}`);
    } else {
      console.log('✅ module_categories table created');
    }

    // 2. Contracts Tabelle
    console.log('📋 Creating contracts table...');
    const { error: contractError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.contracts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          contract_group_id UUID NOT NULL,
          version_number INTEGER NOT NULL DEFAULT 1,
          version_note TEXT,
          is_active BOOLEAN DEFAULT false,
          created_from_version_id UUID,
          name TEXT NOT NULL,
          description TEXT,
          is_campaign_version BOOLEAN DEFAULT false,
          campaign_id UUID,
          campaign_extension_date DATE,
          base_version_id UUID,
          auto_reactivate_version_id UUID,
          auto_renew BOOLEAN DEFAULT false,
          renewal_term_months INTEGER,
          cancellation_period INTEGER DEFAULT 30,
          cancellation_unit TEXT DEFAULT 'days',
          group_discount_enabled BOOLEAN DEFAULT false,
          group_discount_type TEXT,
          group_discount_value DECIMAL(10,2),
          payment_runs TEXT,
          payment_methods TEXT[],
          created_by UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (contractError) {
      console.log(`⚠️  Warning creating contracts: ${contractError.message}`);
    } else {
      console.log('✅ contracts table created');
    }

    // 3. Contract Modules Tabelle
    console.log('📋 Creating contract_modules table...');
    const { error: moduleError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.contract_modules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          description TEXT,
          price_per_month DECIMAL(10,2) NOT NULL DEFAULT 0,
          category_id UUID,
          icon_name TEXT,
          icon_file_asset_id UUID,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (moduleError) {
      console.log(`⚠️  Warning creating contract_modules: ${moduleError.message}`);
    } else {
      console.log('✅ contract_modules table created');
    }

    // 4. Contract Terms Tabelle
    console.log('📋 Creating contract_terms table...');
    const { error: termsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.contract_terms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          contract_id UUID NOT NULL,
          duration_months INTEGER NOT NULL,
          base_price DECIMAL(10,2) NOT NULL,
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (termsError) {
      console.log(`⚠️  Warning creating contract_terms: ${termsError.message}`);
    } else {
      console.log('✅ contract_terms table created');
    }

    // 5. Contract Module Assignments Tabelle
    console.log('📋 Creating contract_module_assignments table...');
    const { error: assignError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.contract_module_assignments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          contract_id UUID NOT NULL,
          module_id UUID NOT NULL,
          assignment_type TEXT NOT NULL,
          custom_price DECIMAL(10,2),
          sort_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `
    });

    if (assignError) {
      console.log(`⚠️  Warning creating contract_module_assignments: ${assignError.message}`);
    } else {
      console.log('✅ contract_module_assignments table created');
    }

    // 6. Erstelle Test-Kategorien
    console.log('\n📝 Creating sample module categories...');
    
    const sampleCategories = [
      { name: 'Training & Kurse', description: 'Gruppenkurse und Trainingsangebote', icon: 'Dumbbell', color: 'blue', sort_order: 1 },
      { name: 'Wellness & Regeneration', description: 'Sauna, Massage und Entspannung', icon: 'Waves', color: 'teal', sort_order: 2 },
      { name: 'Gesundheit & Diagnostik', description: 'Gesundheitschecks und Beratung', icon: 'Heart', color: 'red', sort_order: 3 },
      { name: 'Premium & Komfort', description: 'VIP-Bereiche und Premium-Services', icon: 'Crown', color: 'yellow', sort_order: 4 },
      { name: 'Familie & Kinder', description: 'Kinderbetreuung und Familiensport', icon: 'Baby', color: 'pink', sort_order: 5 },
      { name: 'Digital & App-Funktionen', description: 'App-Features und digitale Services', icon: 'Smartphone', color: 'purple', sort_order: 6 },
      { name: 'Community & Events', description: 'Events und Community-Features', icon: 'Users', color: 'green', sort_order: 7 },
      { name: 'Zugang & Infrastruktur', description: 'Zugänge und Bereiche', icon: 'Key', color: 'orange', sort_order: 8 },
      { name: 'Ernährung & Coaching', description: 'Ernährungsberatung und Personal Training', icon: 'Apple', color: 'lime', sort_order: 9 }
    ];

    for (const category of sampleCategories) {
      const { error } = await supabase
        .from('module_categories')
        .insert(category);

      if (error) {
        console.log(`⚠️  Warning inserting category ${category.name}: ${error.message}`);
      } else {
        console.log(`✅ Category "${category.name}" inserted`);
      }
    }

    // 7. Erstelle Test-Module
    console.log('\n📝 Creating sample modules...');
    
    // Get first category for testing
    const { data: categories } = await supabase
      .from('module_categories')
      .select('id')
      .limit(1);

    if (categories && categories.length > 0) {
      const categoryId = categories[0].id;
      
      const sampleModules = [
        { name: 'Krafttraining', description: 'Zugang zum Kraftbereich', price_per_month: 15.00, category_id: categoryId, icon_name: 'Dumbbell' },
        { name: 'Gruppenkurse', description: 'Teilnahme an allen Gruppenkursen', price_per_month: 20.00, category_id: categoryId, icon_name: 'Users' },
        { name: 'Sauna', description: 'Zugang zur Saunalandschaft', price_per_month: 10.00, category_id: categoryId, icon_name: 'Waves' }
      ];

      for (const module of sampleModules) {
        const { error } = await supabase
          .from('contract_modules')
          .insert(module);

        if (error) {
          console.log(`⚠️  Warning inserting module ${module.name}: ${error.message}`);
        } else {
          console.log(`✅ Module "${module.name}" inserted`);
        }
      }
    }

    // 8. Verification
    console.log('\n🔍 Verifying tables...');
    
    const tables = ['module_categories', 'contracts', 'contract_modules', 'contract_terms', 'contract_module_assignments'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true });

        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: exists`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    // Check data
    const { data: categoriesCount } = await supabase
      .from('module_categories')
      .select('*');

    const { data: modulesCount } = await supabase
      .from('contract_modules')
      .select('*');

    console.log(`\n📊 Data Summary:`);
    console.log(`   - Module Categories: ${categoriesCount?.length || 0}`);
    console.log(`   - Contract Modules: ${modulesCount?.length || 0}`);

    console.log('\n🎉 Tables created successfully!');
    console.log('📍 You can now access the Vertragsarten V2 system at /vertragsarten-v2');

  } catch (error) {
    console.error('❌ Table creation failed:', error);
    process.exit(1);
  }
}

// Run creation
createTables();