// Test Script für Lead-Validierung mit korrekten Feldnamen
// In der Browser-Konsole der Formular-Vorschau ausführen

console.log('🧪 Testing Lead Validation with correct field names...')

// Test 1: Unvollständiges Lead-Formular (nur Vorname)
const testData1 = {
  firstname: 'Max'
}

console.log('Test 1 - Nur Vorname:', testData1)
// Erwartung: Fehler wegen fehlender E-Mail/Telefon

// Test 2: Vollständiges Lead-Formular (korrekte Feldnamen)
const testData2 = {
  firstname: 'Max',
  nachname: 'Mustermann', 
  e_mail_adresse: 'max@test.com'
}

console.log('Test 2 - Vollständig (korrekte Feldnamen):', testData2)
// Erwartung: Erfolgreich

// Test 3: Mit Telefon statt E-Mail (korrekte Feldnamen)
const testData3 = {
  firstname: 'Anna',
  nachname: 'Schmidt',
  telefonnummer: '+49 123 456789'
}

console.log('Test 3 - Mit Telefon (korrekte Feldnamen):', testData3)
// Erwartung: Erfolgreich

// Test 4: Prüfe aktuell ausgefüllte Formulardaten
console.log('📋 Aktuell im Formular eingegeben:')
console.log('- firstname:', document.querySelector('input[name="firstname"]')?.value)
console.log('- nachname:', document.querySelector('input[name="nachname"]')?.value)
console.log('- e_mail_adresse:', document.querySelector('input[name="e_mail_adresse"]')?.value)
console.log('- telefonnummer:', document.querySelector('input[name="telefonnummer"]')?.value)

console.log('✅ Tests definiert. Führe sie in der Formular-Vorschau aus.')
console.log('💡 Tipp: Öffne die Browser-Konsole (F12) und klicke "Test-Daten absenden" um Debug-Output zu sehen.') 