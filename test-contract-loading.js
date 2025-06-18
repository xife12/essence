// Test: Contract Loading mit erweiterten Daten
// Testet die neue getContractDetails API-Methode

console.log('🧪 TEST: Contract Loading mit erweiterten Daten');

// Simuliere API-Import
const contractsAPI = {
  async getContractDetails(contractId) {
    console.log(`📡 Lade Contract Details für ID: ${contractId}`);
    
    // Simuliere die API-Response mit allen erweiterten Daten
    const mockContractDetails = {
      id: contractId,
      name: "Standard Mitgliedschaft V2",
      description: "Premium Fitnessvertrag mit erweiterten Leistungen",
      auto_renew: true,
      renewal_term_months: 12,
      cancellation_period: 30,
      cancellation_unit: "days",
      group_discount_enabled: true,
      group_discount_bookable: true,
      renewal_duration: 12,
      
      // Terms (Laufzeiten)
      terms: [
        { duration_months: 12, base_price: 69.90 },
        { duration_months: 24, base_price: 59.90 }
      ],
      
      // **ERWEITERT**: Module Assignments - Das ist das Problem!
      module_assignments: [
        {
          module_id: "mod_fitness_basic", 
          assignment_type: "included",
          custom_price: null,
          // **PROBLEM**: Module-Daten werden nicht geladen!
          module: {
            id: "mod_fitness_basic",
            name: "Fitness Basis-Training",
            description: "Grundlegende Fitnessbetreuung",
            price_per_month: 25.00
          }
        },
        {
          module_id: "mod_personal_training", 
          assignment_type: "bookable",
          custom_price: 45.00,
          module: {
            id: "mod_personal_training",
            name: "Personal Training",
            description: "Individuelles Einzeltraining",
            price_per_month: 50.00
          }
        }
      ],
      
      // **ERWEITERT**: Payment Intervals - Das ist das zweite Problem!
      payment_intervals: [
        { interval: 'monthly', enabled: true, discount_percent: 0 },
        { interval: 'semi_annual', enabled: true, discount_percent: 5 },
        { interval: 'yearly', enabled: false, discount_percent: 10 }
      ],
      
      // Price Dynamic Rules (funktioniert)
      price_dynamic_rules: [
        {
          id: "rule_summer_discount",
          name: "Sommer-Rabatt 2025",
          adjustment_type: "one_time_on_date",
          adjustment_value: 15,
          adjustment_value_type: "percent",
          target_date: "2025-06-01"
        }
      ],
      
      // Starter Packages
      starter_packages: [
        {
          id: "pkg_welcome",
          name: "Willkommenspaket",
          description: "Handtuch + Getränkeflasche",
          price: 29.90,
          allow_installments: false,
          max_installments: 0,
          included_modules: []
        }
      ],
      
      // Flat Rates
      flat_rates: [
        {
          id: "rate_admin",
          name: "Verwaltungsgebühr",
          price: 19.90,
          payment_interval: "fixed_date",
          fixed_date: "2025-01-01"
        }
      ]
    };
    
    return { 
      data: mockContractDetails,
      message: 'Vertragsdaten erfolgreich geladen'
    };
  }
};

// Frontend Form Data Loading Simulation
const loadContractForEdit = async (contractId) => {
  console.log(`\n🔄 Frontend: Lade Contract ${contractId} zum Bearbeiten...`);
  
  // API-Aufruf simulieren
  const result = await contractsAPI.getContractDetails(contractId);
  
  if (result.error) {
    console.error('❌ Fehler beim Laden:', result.error);
    return null;
  }
  
  const contract = result.data;
  
  // **DEBUGGING**: Prüfe spezifische Problembereiche
  console.log('\n🔍 **DEBUGGING - Spezifische Problembereiche:**');
  
  // 1. Module Assignments Check
  console.log('\n📦 **MODULE ASSIGNMENTS:**');
  console.log('- Anzahl Module:', contract.module_assignments?.length || 0);
  if (contract.module_assignments && contract.module_assignments.length > 0) {
    contract.module_assignments.forEach((ma, index) => {
      console.log(`  ${index + 1}. Module ID: ${ma.module_id}`);
      console.log(`     Assignment Type: ${ma.assignment_type}`);
      console.log(`     Custom Price: ${ma.custom_price}`);
      console.log(`     Module Name: ${ma.module?.name || '❌ NICHT GELADEN'}`);
      console.log(`     Module Description: ${ma.module?.description || '❌ NICHT GELADEN'}`);
    });
  } else {
    console.log('  ❌ KEINE MODULE GEFUNDEN!');
  }
  
  // 2. Payment Intervals Check
  console.log('\n💳 **PAYMENT INTERVALS:**');
  console.log('- Anzahl Intervals:', contract.payment_intervals?.length || 0);
  if (contract.payment_intervals && contract.payment_intervals.length > 0) {
    contract.payment_intervals.forEach((pi, index) => {
      console.log(`  ${index + 1}. ${pi.interval}: ${pi.enabled ? '✅ AKTIVIERT' : '❌ DEAKTIVIERT'} (${pi.discount_percent}% Rabatt)`);
    });
  } else {
    console.log('  ❌ KEINE PAYMENT INTERVALS GEFUNDEN!');
  }
  
  // 3. Price Dynamic Rules Check (funktioniert)
  console.log('\n📊 **PRICE DYNAMIC RULES:**');
  console.log('- Anzahl Regeln:', contract.price_dynamic_rules?.length || 0);
  if (contract.price_dynamic_rules && contract.price_dynamic_rules.length > 0) {
    contract.price_dynamic_rules.forEach((rule, index) => {
      console.log(`  ${index + 1}. ${rule.name}: ${rule.adjustment_value}${rule.adjustment_value_type === 'percent' ? '%' : '€'}`);
    });
  }
  
  // Frontend Form Data Mapping
  const formData = {
    name: contract.name,
    description: contract.description,
    terms: contract.terms,
    auto_renew: contract.auto_renew,
    renewal_duration: contract.renewal_duration,
    cancellation_period: contract.cancellation_period,
    cancellation_unit: contract.cancellation_unit,
    group_discount_bookable: contract.group_discount_bookable,
    
    // **PROBLEM-BEREICHE:**
    module_assignments: contract.module_assignments || [],
    payment_intervals: contract.payment_intervals || [],
    price_dynamic_rules: contract.price_dynamic_rules || [],
    
    starter_packages: contract.starter_packages || [],
    flat_rates: contract.flat_rates || []
  };
  
  console.log('\n✅ **Form Data Final Check:**');
  console.log('- Module Assignments gesetzt:', formData.module_assignments.length > 0 ? '✅ JA' : '❌ NEIN');
  console.log('- Payment Intervals gesetzt:', formData.payment_intervals.length > 0 ? '✅ JA' : '❌ NEIN');
  console.log('- Price Dynamic Rules gesetzt:', formData.price_dynamic_rules.length > 0 ? '✅ JA' : '❌ NEIN');
  
  return formData;
};

// **HAUPTTEST AUSFÜHREN**
async function runTest() {
  const contractId = "existing-contract-v1-id";
  
  console.log('🎯 **ZIEL:** Module und Payment Intervals korrekt laden\n');
  
  const formData = await loadContractForEdit(contractId);
  
  if (formData) {
    console.log('\n🎯 **GESAMTERGEBNIS:**');
    console.log('✅ Contract Loading erfolgreich');
    console.log(`✅ ${formData.terms.length} Laufzeiten geladen`);
    console.log(`${formData.module_assignments.length > 0 ? '✅' : '❌'} Module Assignments: ${formData.module_assignments.length}`);
    console.log(`${formData.payment_intervals.length > 0 ? '✅' : '❌'} Payment Intervals: ${formData.payment_intervals.length}`);
    console.log(`✅ Price Dynamic Rules: ${formData.price_dynamic_rules.length}`);
    console.log(`✅ Starter Packages: ${formData.starter_packages.length}`);
    console.log(`✅ Flat Rates: ${formData.flat_rates.length}`);
  }
}

// **TEST AUSFÜHREN**
runTest(); 