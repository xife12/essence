# Task: Startpaket-Integration bei Mitgliedererstellung

## 📋 PRD Reference
**Business Context:** Startpakete werden einmalig bei Neuanmeldung berechnet  
**User Story:** Als Studiobetreiber möchte ich, dass Startpakete automatisch bei der Mitgliedererstellung berechnet und angezeigt werden  
**Business Value:** Transparente Kostenrechnung für Neukunden, automatisierte Erstabrechnung

## 🎯 Akzeptanzkriterien
- [ ] Startpaket-Preise werden in MembershipForm angezeigt
- [ ] Einmalige Berechnung bei neuer Mitgliedschaft
- [ ] Übersicht der enthaltenen Startpaket-Komponenten
- [ ] Integration in Gesamtpreis-Kalkulation
- [ ] Speicherung der Startpaket-Gebühr bei Mitgliedserstellung

## 🔧 Technische Anforderungen

### API-Erweiterung erforderlich:
```typescript
// lib/api/contracts-v2.ts
async getContractWithStarterPackages(contractId: string): Promise<ApiResponse<ContractWithStarterPackages>> {
  // Vertrag mit Startpaketen laden
}

async calculateMembershipTotal(contractId: string, termId: string): Promise<{
  basePrice: number;
  starterPackagePrice: number;
  totalFirstPayment: number;
  monthlyPrice: number;
}> {
  // Gesamtkalkulation mit Startpaket
}
```

### UI-Komponenten erweitern:
```typescript
// components/mitglieder/MembershipForm.tsx
const StarterPackageDisplay = ({ packages }: { packages: ContractStarterPackage[] }) => {
  // Startpaket-Anzeige mit Preisen
};

const PricingBreakdown = ({ basePrice, starterPackage, total }: PricingProps) => {
  // Aufschlüsselung der Gesamtkosten
};
```

## 📊 Subtasks
1. **API-Integration**: ContractV2API um Startpaket-Logik erweitern
2. **UI-Komponente**: StarterPackageDisplay erstellen  
3. **Preiskalkulation**: Gesamtpreis-Berechnung implementieren
4. **Form-Integration**: MembershipForm um Startpaket-Anzeige erweitern
5. **Datenpersistierung**: Startpaket-Gebühr in membership speichern

## 🔬 Testing
- [ ] Startpaket-Anzeige bei verschiedenen Vertragsarten
- [ ] Korrekte Preisberechnung bei Pflicht- und optionalen Paketen
- [ ] Mitgliedschaftserstellung mit Startpaket-Gebühr
- [ ] Mobile Responsivität der Preis-Übersicht

## 📅 Aufwand: 4-6 Stunden
**Komplexität:** 6/10  
**Priorität:** HOCH - Blockiert vollständige Mitgliederverwaltung

## 🔗 Dependencies
- ContractsV2API vollständig funktional ✅
- MembershipForm existiert ✅  
- Contract Starter Packages Datenstruktur ✅
- Braucht: Preis-Kalkulations-Logic 