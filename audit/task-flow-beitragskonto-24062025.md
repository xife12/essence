# 🚀 TASK-FLOW: Beitragskonto-System Erweiterung (24.06.2025)

## ✅ **STATUS: ALLE SPEZIFIKATIONEN GEKLÄRT - BEREIT FÜR IMPLEMENTATION**

### **🎯 KLÄRUNG DER BUSINESS-REQUIREMENTS: ABGESCHLOSSEN**

#### **"Offen"-Spalte Logik (FINAL GEKLÄRT):**
- **0 Euro** = Alles bezahlt 
- **Differenzbetrag** = Bei anteiliger Bezahlung
- **Ursprünglicher Betrag** = Bei vollständiger Rücklastschrift (RL)

#### **Forderungstypen-System (GEKLÄRT):**
- Erweitere `transaction_type` ENUM um 'pauschale'
- Mapping: Startpaket → startpaket, Beiträge → beitrag, Pauschale → pauschale, Gebühren → gebuehr

#### **Sales-Tool-Integration (GEKLÄRT):**
- Platzhalter-Felder implementieren für zukünftige Integration
- Origin-Tracking: 'sales_tool' | 'manual' | 'import' | 'automatic'

#### **Automatische Business-Logic (GEKLÄRT):**
- **Stillegungen**: Rückwirkend (Gutschrift), Zukünftig (Nullstellung), Reaktivierung (Verlängerung)
- **Kündigungen**: Sonderkündigungsrecht + Studio-Kündigungen → automatische Stornierung
- **Guthaben**: Automatische Verrechnung mit zukünftigen Fälligkeiten

---

## 📋 **IMPLEMENTIERUNGS-TASK-FLOW (4 PHASEN)**

### **🔧 PHASE 1: Datenbankstruktur erweitern (2-3 Stunden)**

#### **Task 1.1: transaction_type ENUM erweitern**
```sql
ALTER TYPE transaction_type ADD VALUE 'pauschale';
```
**Output**: Vollständige Forderungstypen-Abdeckung

#### **Task 1.2: Sales-Tool-Platzhalter Felder**
```sql
ALTER TABLE member_transactions ADD COLUMN sales_tool_reference_id UUID;
ALTER TABLE member_transactions ADD COLUMN sales_tool_origin TEXT CHECK (...);
ALTER TABLE member_transactions ADD COLUMN business_logic_trigger TEXT;
```
**Output**: Future-ready für Sales-Tool-Integration

#### **Task 1.3: Enhanced Payment-Status-Tracking**
```sql
ALTER TABLE payment_run_items ADD COLUMN partial_payment_amount DECIMAL(10,2);
ALTER TABLE payment_run_items ADD COLUMN return_partial_amount DECIMAL(10,2);
ALTER TABLE payment_run_items ADD COLUMN outstanding_amount DECIMAL(10,2) GENERATED ALWAYS AS (...);
```
**Output**: Präzise "Offen"-Berechnung möglich

---

### **💰 PHASE 2: Beitragskonto-Komponente erweitern (4-5 Stunden)**

#### **Task 2.1: BeitragskontoHeader.tsx erstellen**
```typescript
interface BeitragskontoHeader {
  saldo: { amount: number; status: 'offen'|'ausgeglichen'|'guthaben'; color: string };
  naechste_faelligkeit: { date: string; amount: number; type: string };
  bereits_gezahlt_kumuliert: { amount: number; seit_vertragsbeginn: string };
}
```
**Output**: Header mit Saldo (farblich), nächste Fälligkeit, kumulierte Zahlungen

#### **Task 2.2: BeitragskontoTable.tsx erweitern**
**Spalten-Struktur**: Fälligkeit | Typ | Beschreibung | Lastschriftgruppe | Betrag | USt. | Zahlweise | Offen
**Output**: Exakte Tabellen-Darstellung nach Spezifikation

#### **Task 2.3: "Offen"-Logik implementieren**
```typescript
// FORMEL: offen = faelliger_betrag - bereits_gezahlt + ruecklastschriften
interface OffenBerechnung {
  faelliger_betrag: number;
  bereits_gezahlt: number; 
  ruecklastschriften: number;
  offen_betrag: number; // 0€ | Differenz | Ursprungsbetrag
}
```
**Output**: Präzise "Offen"-Berechnung nach Business-Requirements

#### **Task 2.4: MemberPaymentCard.tsx Integration**
**Output**: Nahtlose Integration in bestehenden "Beitragskonto"-Tab

---

### **🛠️ PHASE 3: Zahllaufgruppen-Dashboard (3-4 Stunden)**

#### **Task 3.1: Route erstellen**
- **Route**: `/payment-system/zahllaufgruppen`
- **Navigation**: Finanzen → Zahllaufgruppen
**Output**: Neue Dashboard-Route verfügbar

#### **Task 3.2: ZahllaufgruppenDashboard.tsx**
```typescript
interface ZahllaufgruppeEntry {
  name: string;
  status: 'aktiv'|'inaktiv';
  faelligkeit: string;
  forderungstypen: ('startpaket'|'beiträge'|'pauschale'|'gebühren')[];
  mitglieder_anzahl: number;
  gesamtbetrag: number;
}
```
**Output**: Listen-Darstellung aller Zahllaufgruppen mit Status-Badges

#### **Task 3.3: ZahllaufgruppenModal.tsx**
```typescript
interface ZahllaufgruppenSettings {
  name: string;                    // Text-Input
  forderungstypen: {               // Checkboxen
    startpaket: boolean;
    beiträge: boolean; 
    pauschale: boolean;
    gebühren: boolean;
  };
  faelligkeit: string;             // Datumauswahl
}
```
**Output**: Einstellungs-Modal für CRUD-Operationen

#### **Task 3.4: API-Integration**
**Output**: Vollständige Zahllaufgruppen-API mit CRUD-Funktionalität

---

### **🔄 PHASE 4: Business-Logic-Automatisierung (4-6 Stunden)**

#### **Task 4.1: Stillegung-Engine**
```typescript
// Rückwirkende Stillegung → Gutschrift
if (stillegung.start_date < letzter_abbuchungstermin) {
  createTransaction({ type: 'storno', amount: rueckerstattung });
}

// Zukünftige Stillegung → Nullstellung
betroffene_fälligkeiten.forEach(f => updateTransaction(f.id, { amount: 0 }));

// Reaktivierung → Verlängerung
const neues_end_datum = addDaysToDate(original_end_date, stillegungsdauer);
```
**Output**: Vollautomatische Stillegung-Verarbeitung

#### **Task 4.2: Kündigungs-Automatik**
```typescript
const kuendigungsgruende_automatisch = [
  'sonderkuendigung', 'studio_verschulden', 'gesundheitliche_gruende', 'umzug_nachweisbar'
];

if (kuendigungsgruende_automatisch.includes(kuendigung.grund)) {
  // Alle zukünftigen Fälligkeiten stornieren
  zukuenftige_fälligkeiten.forEach(f => createTransaction({ type: 'storno', amount: f.amount }));
}
```
**Output**: Automatische Stornierung bei Sonderkündigungsrecht

#### **Task 4.3: Guthaben-Management**
```typescript
if (member_account.balance > 0) {
  naechste_fälligkeiten.forEach(fälligkeit => {
    if (verbleibendes_guthaben >= fälligkeit.amount) {
      markAsPaid(fälligkeit.id, 'guthaben_verrechnung');
    }
  });
}
```
**Output**: Automatische Guthaben-Verrechnung mit zukünftigen Fälligkeiten

#### **Task 4.4: Enhanced PaymentSystemAPI**
```typescript
async getBeitragskontoHeader(memberId: string): Promise<BeitragskontoHeader>
async processStillegung(memberId: string, stillegung: StillegungRequest): Promise<StillegungResponse>
async processAutomaticStornierung(memberId: string, kuendigung: KuendigungRequest): Promise<StornierungResponse>
async processGuthabenVerrechnung(memberId: string): Promise<VerrechnungResponse>
```
**Output**: Vollständige API für alle automatisierten Business-Prozesse

---

## 🎯 **SUCCESS CRITERIA**

### **Phase 1: Datenbankstruktur**
- ✅ transaction_type erweitert um 'pauschale'
- ✅ Sales-Tool-Platzhalter implementiert  
- ✅ Enhanced Status-Tracking für "Offen"-Berechnung

### **Phase 2: Beitragskonto-Komponente**
- ✅ Header mit Saldo (farblich), nächste Fälligkeit, kumulierte Zahlungen
- ✅ Tabellen-Struktur exakt nach Spezifikation
- ✅ "Offen"-Logik: 0€ | Differenz | Ursprungsbetrag präzise berechnet

### **Phase 3: Zahllaufgruppen-Dashboard**
- ✅ Route `/payment-system/zahllaufgruppen` funktional
- ✅ Listen-Darstellung mit Status-Badges und Fälligkeitsdatum
- ✅ CRUD-Operationen für Zahllaufgruppen-Einstellungen

### **Phase 4: Business-Logic-Automatisierung**
- ✅ Stillegung-Engine: Rückwirkend (Gutschrift), Zukünftig (Nullstellung), Reaktivierung (Verlängerung)
- ✅ Kündigungs-Automatik: Sonderkündigungsrecht → automatische Stornierung
- ✅ Guthaben-Management: Automatische Verrechnung mit zukünftigen Fälligkeiten

---

## 📊 **FINAL DELIVERABLES**

### **Frontend-Komponenten:**
1. `BeitragskontoHeader.tsx` - Header mit Saldo/Fälligkeit/Kumulation
2. `BeitragskontoTable.tsx` - Erweiterte Tabelle mit "Offen"-Logik
3. `ZahllaufgruppenDashboard.tsx` - Dashboard mit Listen-Darstellung
4. `ZahllaufgruppenModal.tsx` - Einstellungs-Modal für CRUD

### **Backend-Erweiterungen:**
1. Database-Schema-Updates (transaction_type, Sales-Tool-Felder, Status-Tracking)
2. Enhanced PaymentSystemAPI (4 neue Methoden für Business-Logic)
3. ZahllaufgruppenAPI (Vollständige CRUD-Operationen)
4. BusinessLogicEngine (Automatisierte Stillegung/Kündigung/Guthaben)

### **System-Integration:**
1. Tab-Integration: Erweiterte Darstellung im "Beitragskonto"-Tab
2. Navigation: Neue Route für Zahllaufgruppen-Dashboard
3. SEPA-Integration: Zahllaufgruppen ↔ Payment-Runs ↔ XML-Generation

---

## 🚀 **BEREIT FÜR INITIALISIERUNG**

✅ **Alle Business-Requirements geklärt**  
✅ **Memory Bank vollständig aktualisiert**  
✅ **Alle .mdc Dateien nach System-Health-Orchestrator erstellt**  
✅ **4-Phasen-Task-Flow definiert**  
✅ **Success Criteria eindeutig spezifiziert**  

**🎯 BEREIT FÜR IMPLEMENTATION-FREIGABE 🎯**

---

*Erstellt: 24.06.2025 - Beitragskonto-System Extension Task Flow* 