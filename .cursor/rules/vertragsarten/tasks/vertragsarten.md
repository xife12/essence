# Task für Vertragsarten-System V2

## 📋 PRD Reference
**Business Context:** Komplette Vertragsverwaltung für Fitnessstudios mit Modulen, Preisdynamik und Dokumentenerstellung  
**User Story:** Als Studiobetreiber möchte ich ein umfassendes Vertragssystem um alle Aspekte der Mitgliedschaftsverwaltung abzudecken  
**Business Value:** Automatisierte Vertragserstellung, -verwaltung und -verlängerung, reduzierte manuelle Arbeit

## 🎯 Akzeptanzkriterien
- [x] V2 System vollständig implementiert (3-Bereich-Struktur)
- [x] Versionierung automatisch für Verträge und Dokumente
- [x] Alle 3 Preistypen funktional (einmalig, stichtag, wiederholend)
- [x] Modulares System mit Kategorien und Zuordnung
- [x] TypeScript-Typen vollständig definiert (491 Zeilen)
- [ ] **KRITISCH**: Startpaket-Integration bei Mitgliedererstellung
- [ ] **IMPORTANT**: Kampagnen-Zeitraum automatische Übernahme
- [x] Dashboard mit Statistiken und KPI-Übersicht

## 🔧 Technische Anforderungen

### Vollständig implementiert ✅
- **3-Bereich-System**: Verträge, Module, Dokumente (95% komplett)
- **Datenbank-Schema**: contracts_v2, contract_modules, contract_documents
- **API-Layer**: ContractsV2API, ModulesAPI, DocumentsAPI
- **UI-Flows**: Dashboard, CRUD-Operationen, Versionierung

### Kritische Gaps identifiziert 🔴
#### 1. Startpaket-Integration fehlt
```typescript
// FEHLT in MembershipForm.tsx:
const calculateStarterPackagePrice = (contractType: ContractType) => {
  return contractType.starter_packages?.reduce((total, pkg) => total + pkg.price, 0) || 0;
};
```

#### 2. Kampagnen-Zeitraum Automatisierung unvollständig
```typescript  
// TEILWEISE in CampaignModal: Zeitraum da, aber keine automatische Übernahme
const handleCampaignSelect = (campaignId: string) => {
  const campaign = campaigns.find(c => c.id === campaignId);
  if (campaign) {
    setFormData({
      ...formData,
      valid_from: campaign.start_date,
      valid_until: campaign.end_date,
      campaign_id: campaignId
    });
  }
};
```

## 🎗️ Abhängigkeiten

### Erfüllt ✅
- [x] **Mitglieder**: Vertragsverknüpfung funktional
- [x] **Landingpages**: Pricing-Blöcke integriert  
- [x] **Formbuilder**: Vertragsauswahl verfügbar
- [x] **Kampagnen**: Grundverknüpfung vorhanden

### Blockiert durch Gaps ⚠️
- [ ] **Mitgliederverwaltung**: Startpaket-Integration fehlt für vollständige Funktionalität
- [ ] **Kampagnen**: Automatische Zeitraumübernahme unvollständig

## 📊 Subtasks (Research-Backed)

### 🔴 HIGH PRIORITY (Blocking andere Module)
1. **Startpaket-Integration** (Komplexität: 6/10, ~4-6h)
   - [ ] MembershipForm.tsx erweitern um Startpaket-Berechnung
   - [ ] API-Endpunkt für Startpaket-Daten  
   - [ ] Persistierung in membership-Datensatz
   - [ ] UI-Komponente für Startpaket-Übersicht

2. **Kampagnen-Zeitraum Automatisierung** (Komplexität: 4/10, ~3-4h)
   - [ ] Automatische Übernahme bei Kampagnenauswahl
   - [ ] UI-Toggle für manuelle/automatische Zeiträume
   - [ ] Validierung für Kampagnen-Zeiträume

### ✅ COMPLETED (V2 Implementation)
- [x] **Modulares Vertragsystem** - 3-Bereich-Struktur implementiert
- [x] **Versionierungs-Engine** - Automatische Versioning für contracts & documents  
- [x] **Preisdynamik-System** - Alle 3 Typen (einmalig, stichtag, wiederholend)
- [x] **API-Framework** - Vollständige REST API mit TypeScript-Typen
- [x] **Dashboard & Analytics** - KPI-Übersicht und Statistiken
- [x] **WYSIWYG Document Editor** - Vertragsdokumente mit PDF-Vorschau

## 📈 Success Metrics
- **Implementation**: 95% → 100% (nach Gap-Fixes)
- **User Workflow**: Vollständiger Lead-to-Member Pipeline (blockiert durch Startpaket)
- **Automation**: Kampagnen-Integration fully automated
- **Data Integrity**: Korrekte Startpaket-Persistierung in memberships

## 🔗 Verknüpfungen
- **Modul-Rules**: `.cursor/rules/vertragsarten/vertragsarten-v2-overview.mdc`
- **Implementation**: `app/(protected)/vertragsarten-v2/`
- **API-Layer**: `app/lib/api/contracts-v2.ts`
- **Types**: `app/lib/types/contracts-v2.ts`
- **Related Tasks**: 
  - `startpaket-integration.md` (PRIORITY: HIGH)
  - `kampagnen-integration.md` (PRIORITY: MEDIUM)

## 🧱 Komplexität & Priorität
- **Gesamt-Komplexität**: 8/10 (komplexe Vertragslogik mit Modulen)
- **Aktueller Status**: 95% implementiert (V2 System vollständig)
- **Priorität**: HIGH (Gaps blockieren andere Module)
- **Geschätzter Aufwand**: 7-10h für Gap-Completion

## 📅 Status
**✅ V2 SYSTEM IMPLEMENTIERT (95%)**
- **Nächste Schritte**: Implementation der 2 identifizierten Gaps
- **Blocker**: Startpaket-Integration fehlt für vollständige Mitgliederverwaltung
- **Timeline**: 1-2 Tage für Gap-Completion bei focused work 