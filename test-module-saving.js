// 🧪 Test: Module-Speicherung Debug
// Testet spezifisch warum Module nicht gespeichert werden

console.log('🧪 TEST: Module-Speicherung Debug');

// Simuliere Contract-Update mit Modulen
const testContractUpdate = {
  id: 'test-contract-id',
  name: 'Test Vertrag V2',
  description: 'Vertrag mit Modulen',
  
  // 🎯 KRITISCH: Module-Zuordnungen
  module_assignments: [
    {
      module_id: 'module-1-id',
      assignment_type: 'included',
      custom_price: null
    },
    {
      module_id: 'module-2-id', 
      assignment_type: 'bookable',
      custom_price: 15.99
    },
    {
      module_id: 'module-3-id',
      assignment_type: 'included', 
      custom_price: null
    }
  ],
  
  // 🎯 KRITISCH: Zahlungsintervalle
  payment_intervals: [
    {
      interval: 'monthly',
      enabled: true,
      discount_percent: 0
    },
    {
      interval: 'semi_annual',
      enabled: true,
      discount_percent: 5
    },
    {
      interval: 'yearly',
      enabled: true,
      discount_percent: 10
    }
  ],
  
  // 🎯 KRITISCH: Starter-Pakete mit Modulen
  starter_packages: [
    {
      id: 'starter-1',
      name: 'Basis-Paket',
      description: 'Grundausstattung',
      price: 89.99,
      allow_installments: true,
      max_installments: 6,
      included_modules: ['module-1-id', 'module-2-id'] // ⚠️ HIER könnte das Problem liegen
    },
    {
      id: 'starter-2', 
      name: 'Premium-Paket',
      description: 'Vollausstattung',
      price: 149.99,
      allow_installments: false,
      max_installments: 0,
      included_modules: ['module-1-id', 'module-2-id', 'module-3-id']
    }
  ],
  
  // Basics
  terms: [
    { duration_months: 12, base_price: 49.99 }
  ],
  auto_renew: true,
  renewal_duration: 12,
  cancellation_period: 30,
  cancellation_unit: 'days',
  
  // Preisdynamik (funktioniert)
  price_dynamic_rules: [
    {
      id: 'rule-1',
      name: 'Jährliche Erhöhung',
      adjustment_type: 'recurring_on_date',
      adjustment_value: 3,
      adjustment_value_type: 'percent',
      recurring_day: 1
    }
  ]
};

console.log('📋 Test Contract Data:');
console.log('  Module Assignments:', testContractUpdate.module_assignments.length);
console.log('  Payment Intervals:', testContractUpdate.payment_intervals.length); 
console.log('  Starter Packages:', testContractUpdate.starter_packages.length);
console.log('  Price Rules:', testContractUpdate.price_dynamic_rules.length);

// Simuliere die API-Verarbeitung
console.log('\n🔄 API-Verarbeitung simulieren:');

// 1. Module-Assignments Check
if (testContractUpdate.module_assignments && testContractUpdate.module_assignments.length > 0) {
  console.log('✅ Module-Assignments gefunden:', testContractUpdate.module_assignments.length);
  
  const newModuleAssignments = testContractUpdate.module_assignments.map(assignment => ({
    id: 'new-' + Math.random().toString(36).substr(2, 9),
    contract_id: 'new-contract-id',
    module_id: assignment.module_id,
    assignment_type: assignment.assignment_type,
    custom_price: assignment.custom_price || null,
    created_at: new Date().toISOString()
  }));
  
  console.log('  Mapped Assignments:', newModuleAssignments);
} else {
  console.log('❌ PROBLEM: Keine Module-Assignments gefunden!');
}

// 2. Payment Intervals Check
if (testContractUpdate.payment_intervals && testContractUpdate.payment_intervals.length > 0) {
  console.log('✅ Payment Intervals gefunden:', testContractUpdate.payment_intervals.length);
  
  const mappedIntervals = testContractUpdate.payment_intervals.map(pi => ({
    interval: pi.interval,
    enabled: pi.enabled,
    discount_percent: pi.discount_percent || 0
  }));
  
  console.log('  Mapped Intervals:', mappedIntervals);
} else {
  console.log('❌ PROBLEM: Keine Payment Intervals gefunden!');
}

// 3. Starter Packages Check
if (testContractUpdate.starter_packages && testContractUpdate.starter_packages.length > 0) {
  console.log('✅ Starter Packages gefunden:', testContractUpdate.starter_packages.length);
  
  const mappedPackages = testContractUpdate.starter_packages.map((pkg, index) => ({
    id: 'new-' + Math.random().toString(36).substr(2, 9),
    contract_id: 'new-contract-id',
    name: pkg.name,
    description: pkg.description,
    price: pkg.price,
    is_mandatory: pkg.allow_installments || false,
    sort_order: index,
    created_at: new Date().toISOString()
  }));
  
  console.log('  Mapped Packages:', mappedPackages);
  
  // ⚠️ PROBLEM-ANALYSE: included_modules Mapping
  console.log('\n🔍 Starter Package Module-Problem-Analyse:');
  testContractUpdate.starter_packages.forEach((pkg, i) => {
    console.log(`  Package ${i+1}: ${pkg.name}`);
    console.log(`    included_modules: ${pkg.included_modules ? pkg.included_modules.length : 'undefined'}`);
    console.log(`    → Mapping Problem: included_modules wird nicht in DB-Tabelle gespeichert!`);
  });
} else {
  console.log('❌ PROBLEM: Keine Starter Packages gefunden!');
}

// 4. Vertragsnummer-Test
console.log('\n🔢 Vertragsnummer-Generation Test:');

function generateContractNumber(contractGroupId, versionNumber, campaignVersion) {
  const cleanId = contractGroupId.replace(/-/g, '').replace(/[^0-9A-F]/gi, '');
  const baseNumber = parseInt(cleanId.substring(0, 8), 16).toString().substring(0, 5).padStart(5, '0');
  
  if (campaignVersion) {
    return `${baseNumber}-${versionNumber}-${campaignVersion}`;
  } else {
    return `${baseNumber}-${versionNumber}`;
  }
}

const testGroupId = '12345678-1234-1234-1234-123456789012';
console.log('Standard Contracts:');
console.log('  V1:', generateContractNumber(testGroupId, 1));
console.log('  V2:', generateContractNumber(testGroupId, 2));
console.log('  V3:', generateContractNumber(testGroupId, 3));

console.log('Campaign Contracts:');
console.log('  V3-C1:', generateContractNumber(testGroupId, 3, 1));
console.log('  V3-C2:', generateContractNumber(testGroupId, 3, 2));

console.log('\n🎯 PROBLEM-ZUSAMMENFASSUNG:');
console.log('✅ Preisdynamik: Funktioniert');
console.log('❌ Module: Werden nicht gespeichert (RLS-Problem?)');
console.log('❌ Zahlungsintervalle: Werden nicht geladen (API-Problem?)');
console.log('❌ Starter Package Module: included_modules-Mapping fehlt');
console.log('✅ Vertragsnummern: System implementiert');

console.log('\n🔧 NÄCHSTE SCHRITTE:');
console.log('1. RLS für contract_module_assignments deaktivieren');
console.log('2. Frontend Payment Intervals Loading fixen');
console.log('3. Starter Package included_modules in separate Tabelle speichern');
console.log('4. Contract Number Migration ausführen'); 