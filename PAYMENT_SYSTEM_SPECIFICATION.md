# Payment-System Spezifikation - MemberCore

## Problem-Behebung Beitragskalender (24.01.2025)

### Identifizierte Probleme und Lösungen:

#### 1. **Falsches Startdatum für Beiträge** ✅ BEHOBEN
- **Problem**: Beiträge wurden ab 24.1. statt 24.6. (Vertragsstartdatum) erstellt
- **Ursache**: Fixer 3-Monats-Filter in `getBeitragskontoEntries()` 
- **Lösung**: Verwendung des echten `contractStartDate` aus den Mitgliedsdaten
- **Code-Änderung**: `lib/api/payment-system.ts` Zeile 715-720

#### 2. **Falsche Beschreibungsformate** ✅ BEHOBEN  
- **Problem**: Beschreibung war generisch "Monatsbeitrag Juli 2025"
- **Anforderung**: "Name der Mitgliedschaft TT.MM.JJ-TT.MM.JJ"
- **Lösung**: Neue `generateBeitragsbeschreibung()` Methode
- **Beispiel**: "Monatsbeitrag Premium 01.07.25-31.07.25"

#### 3. **Fehlende/falsche Offenstände-Anzeige** ✅ BEHOBEN
- **Problem**: Status zeigte nicht korrekt 0€, 59€ oder Differenzen an
- **Lösung**: Verbesserte `calculateBetterOffenBetrag()` Logik
- **Features**: 
  - Zukünftige Zahlungen = "geplant" 
  - Vergangene Zahlungen = "bezahlt" (0€) oder "offen" (Betrag€)
  - Rücklastschriften = voller Betrag offen

#### 4. **UST-Feld fehlte** ✅ BEHOBEN
- **Problem**: UST wurde zwar in API gesetzt, aber nicht korrekt übertragen
- **Lösung**: Neue `getUSTSatzForTransaction()` Methode
- **Standard**: 19% MwSt für alle Fitness-Services

#### 5. **Obere Bereiche oberhalb Beitragskonto** ✅ KOMPAKT ÜBERARBEITET
Die Bereiche oberhalb des Beitragskontos sind Teil des **Payment-Konto Systems** und zeigen:

---

## Payment-System Struktur (KOMPAKT)

### 1. Payment-Konto Header
```
🏦 Payment-Konto [Korrektur-Button]
```

### 2. Kompakte Finanzstatus-Grid (3-spaltig)

#### Spalte 1: Aktueller Kontostand
- **Zweck**: Zeigt den aktuellen Saldo des Mitgliederkontos
- **Datenquelle**: `member_accounts.current_balance`
- **Status-Badge**: 
  - 🟢 "Ausgeglichen" (= 0€)
  - 🔴 "Offener Betrag" (< 0€) 
  - 🔵 "Guthaben" (> 0€)

#### Spalte 2: Payment-Gruppe + Bearbeiten-Button
- **Zweck**: Zeigt die Zahllaufgruppe für SEPA-Lastschriften
- **Datenquelle**: `payment_groups.name` + `payment_day`
- **Beispiel**: "01. des Monats", "15. des Monats"
- **Bearbeiten**: ✏️ Button zum Ändern der Zahllaufgruppe (nur Admin)
- **Nutzen**: Definiert wann Lastschriften eingezogen werden

#### Spalte 3: IBAN + Bearbeiten-Button
- **Zweck**: Zeigt maskierte IBAN für Lastschriften
- **Datenquelle**: `payment_members.iban` (maskiert, nur letzte 4 Stellen)
- **Bearbeiten**: ✏️ Button zum Ändern der IBAN (nur Admin)
- **Hinweis**: Mitgliedsnummer entfernt - bereits im Mitglieder-Header sichtbar

### 3. Kompakte Letzte Transaktionen
- **Zweck**: Übersicht über aktuelle Zahlungsbewegungen (max. 3 Einträge)
- **Datenquelle**: `member_transactions` (neueste 3 Einträge)
- **Icons**: 
  - 💳 Lastschrift
  - ✅ Einzahlung  
  - ❌ Rücklastschrift
  - 🔧 Korrektur

---

## Beitragskonto-Übersicht (BeitragskontoHeader)

### Status-Anzeige (3-spaltig)

#### 1. Aktueller Saldo
- **Quelle**: Berechnet aus allen offenen/bezahlten Forderungen
- **Format**: "49,90€ offen" / "0,00€ ausgeglichen" / "23,50€ Guthaben"

#### 2. Nächste Fälligkeit  
- **Quelle**: Nächste unbezahlte Forderung aus `beitragskalender`
- **Format**: Betrag + Datum + Typ
- **Null-Behandlung**: "Keine Fälligkeit" wenn keine ausstehenden Zahlungen

#### 3. Bereits gezahlt (kumuliert)
- **Quelle**: Summe aller bezahlten Transaktionen seit Vertragsbeginn
- **Format**: Gesamtbetrag + Anzahl Zahlungen + Zeitraum

---

## Beitragskonto-Einträge (BeitragskontoTable)

### Spalten-Erklärung:

| Spalte | Datenquelle | Format | Beispiel |
|--------|-------------|--------|----------|
| **Fälligkeit** | `referenceDate` | DD.MM.YYYY | 01.07.2025 |
| **Typ** | `transactionType` | Badge | "Monatsbeitrag" |
| **Beschreibung** | Generiert | Mitgliedschaft + Zeitraum | "Premium 01.07.25-31.07.25" |
| **Lastschriftgruppe** | `payment_groups` | Text | "Standard 1." |
| **Betrag** | `amount` | Währung | 89,90€ |
| **USt.** | Berechnet | Prozent | 19% |
| **Zahlweise** | Konfiguration | Text | "Lastschrift" |
| **Offen** | Berechnet | Währung + Icon | 89,90€ ⏳ |

### Status-Icons:
- ✅ Bezahlt (offen = 0€)
- ⏳ Geplant (zukünftige Fälligkeit)  
- ⚠️ Offen (überfällige Zahlung)
- ❌ Rücklastschrift (fehlgeschlagene Zahlung)
- 📅 Geplant (noch nicht fällig)

---

## Datenfluss-Diagramm

```
Mitgliedschaft erstellt (24.06.)
         ↓
Beitragskalender-Generator
         ↓
member_transactions erstellt (ab 24.06.)
         ↓
BeitragskontoHeader API ← member_accounts + member_transactions
         ↓
Frontend-Darstellung mit korrigierten:
- Startdatum (24.06. statt 24.01.)
- Beschreibung ("Premium 01.07.25-31.07.25")  
- UST (19%)
- Offenstände (0€/89,90€ mit Status-Icons)
```

---

## Business-Regeln

### Offen-Berechnung:
```typescript
offen = faelliger_betrag - bereits_gezahlt + ruecklastschriften
```

### Status-Bestimmung:
- `offen === 0` → "bezahlt" ✅
- `offen > 0 && dueDate > today` → "geplant" ⏳
- `offen > 0 && dueDate <= today` → "offen" ⚠️  
- `isReversed === true` → "ruecklastschrift" ❌

### Beschreibungs-Format:
```
{mitgliedschaftsname} {DD.MM.YY}-{DD.MM.YY}
```

---

Diese Spezifikation löst alle 5 identifizierten Probleme und dokumentiert die vollständige Payment-System-Struktur. 