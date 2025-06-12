# 🔧 AKTIONSPLAN: RULE-DATEIEN AUDIT KORREKTUREN

## 🔴 PHASE 1: SOFORTMASSNAHMEN (Heute)

### 1.1 YAML-Header für 22 Dateien hinzufügen

**Reihenfolge nach Wichtigkeit:**

#### A. Kern-Module (höchste Priorität)
```bash
# Diese 6 Dateien sofort korrigieren:
06_Leads.mdc
09_Mitglieder.mdc
08_Mitarbeiterverwaltung.mdc
05_Kampagnen.mdc
16_Dateimanager.mdc
18_vertragsarten.mdc
```

#### B. Erweiterte Module
```bash
# Diese 8 Dateien als nächstes:
04_Beratung.mdc
10_Mitgliedschaften.mdc
11_Passwortmanager.mdc
12_Dashboard.mdc
13_Stundenerfassung.mdc
14_Canva_Integration.mdc
15_contentplaner.mdc
19_aufgaben.mdc
```

#### C. Meta-Dateien
```bash
# Diese 8 Dateien am Ende:
00_datenbankstruktur.mdc
01_Projektbeschreibung.mdc
02_UI_UX_Frontend.mdc
03_Backend_Datenstruktur.mdc
0170_landingpages.mdc
0171_designstyles.mdc
0172_formbuilder.mdc
```

### 1.2 Template für YAML-Header
```yaml
---
description: "[Modul]: [Kurzbeschreibung der Funktionalität]"
alias: "@[modulname]"
globs:
  - "app/(protected)/[modulname]/**"
  - "components/[modulname]/**"
  - "lib/api/[modulname].ts"
---
```

---

## 🟡 PHASE 2: AUFTEILUNG ÜBERLANGER DATEIEN (Diese Woche)

### 2.1 Kritische Aufteilungen (>300 Zeilen)

#### `0172_formbuilder.mdc` (416 Zeilen) → 4 Teildateien
**Aufwand: 2 Stunden**
```
✂️ Aufteilung:
├── formbuilder-ui.mdc        (Zeilen 1-120: Builder, Canvas, Drag&Drop)
├── formbuilder-fields.mdc    (Zeilen 121-220: 18+ Feldtypen, Validierung)
├── formbuilder-api.mdc       (Zeilen 221-320: CRUD, Submissions, Export)
└── formbuilder-analytics.mdc (Zeilen 321-416: KPIs, Charts, Auswertungen)
```

#### `0171_designstyles.mdc` (439 Zeilen) → 3 Teildateien
**Aufwand: 90 Minuten**
```
✂️ Aufteilung:
├── ci-styling-ui.mdc      (Zeilen 1-150: Dashboard, Cards, Navigation)
├── ci-styling-data.mdc    (Zeilen 151-300: API, State, Datenstruktur)
└── ci-styling-master.mdc  (Zeilen 301-439: Master-CI System, Vererbung)
```

#### `0170_landingpages.mdc` (290 Zeilen) → 3 Teildateien
**Aufwand: 60 Minuten**
```
✂️ Aufteilung:
├── landingpages-builder.mdc     (Builder, Blöcke, Drag&Drop)
├── landingpages-testimonials.mdc (Testimonial-System)
└── landingpages-blocks.mdc      (Block-Definitionen, Presets)
```

### 2.2 Grenzwertige Aufteilungen (150-200 Zeilen)

#### `09_Mitglieder.mdc` (168 Zeilen) → 2 Teildateien
```
✂️ Aufteilung:
├── members-ui.mdc          (Frontend, Components, Navigation)
└── memberships-logic.mdc   (Verträge, Status, Kündigungslogik)
```

#### `02_UI_UX_Frontend.mdc` (159 Zeilen) → Umbenennung + Fokussierung
```
🔄 Umbenennung zu: ui-guidelines.mdc
📝 Fokus: Nur allgemeine UI-Regeln, Modul-spezifisches entfernen
```

---

## 🟢 PHASE 3: STRUKTURREORGANISATION (Nächste Woche)

### 3.1 Redundanzen auflösen

#### Mitarbeiter-Module zusammenführen
```bash
# Problem: 2 überschneidende Dateien
07_Mitarbeiter.mdc (100 Zeilen)
08_Mitarbeiterverwaltung.mdc (136 Zeilen)

# Lösung: Merge zu einer Datei
staff-management.mdc (150 Zeilen - optimiert)
```

#### Mitglieder-Module abgrenzen
```bash
# Aktuell:
09_Mitglieder.mdc (Profile, Verträge, Status)
10_Mitgliedschaften.mdc (Vertragslogik)

# Ziel: Klare Trennung
members-profiles.mdc (Profile, UI, Navigation)
memberships-contracts.mdc (Verträge, Kündigungen, Logik)
```

### 3.2 Modulare Verzeichnisstruktur einführen

#### Neue Struktur erstellen:
```bash
mkdir -p .cursor/rules/{core,leads,members,staff,campaigns,formbuilder,ci-styling,landingpages,files}
```

#### Migration durchführen:
```bash
# Core-Dateien
mv 01_Projektbeschreibung.mdc .cursor/rules/core/project-structure.mdc
mv 02_UI_UX_Frontend.mdc .cursor/rules/core/ui-guidelines.mdc
mv 00_datenbankstruktur.mdc .cursor/rules/core/database-schema.mdc

# Modul-Dateien
mv 06_Leads.mdc .cursor/rules/leads/leads-management.mdc
mv 09_Mitglieder.mdc .cursor/rules/members/members-profiles.mdc
mv 10_Mitgliedschaften.mdc .cursor/rules/members/memberships-contracts.mdc
# ... usw.
```

---

## 📊 ERFOLGSMESSUNG

### Vorher (Aktueller Zustand):
- ❌ 22/27 Dateien ohne YAML-Header (81%)
- ❌ 5/27 Dateien zu lang (19%)
- ❌ Flache Struktur in .cursor/rules/
- ❌ Namensinkonsistenzen
- ❌ Themenmischungen

### Nachher (Ziel-Zustand):
- ✅ 35+/35+ Dateien mit korrektem YAML-Header (100%)
- ✅ 0/35+ Dateien über 120 Zeilen (0%)
- ✅ Modulare Verzeichnisstruktur
- ✅ Konsistente Benennung
- ✅ Klare Themenabgrenzung

### Metriken:
```
Datei-Anzahl:      27 → ~35 (nach Aufteilung)
Durchschn. Länge:  116 → ~85 Zeilen
Header-Quote:      19% → 100%
Struktur-Tiefe:    1 → 2-3 Ebenen
Redundanzen:       4 → 0
```

---

## ⏱️ ZEITSCHÄTZUNG

| Phase | Aufwand | Zeitrahmen |
|-------|---------|------------|
| **Phase 1: YAML-Header** | 3-4 Stunden | Heute |
| **Phase 2: Datei-Aufteilung** | 6-8 Stunden | Diese Woche |
| **Phase 3: Strukturreorganisation** | 4-6 Stunden | Nächste Woche |
| **Gesamt** | **13-18 Stunden** | **10 Tage** |

---

## 🚀 NÄCHSTE SCHRITTE

1. **Jetzt sofort:** YAML-Header für Top-6 Module hinzufügen
2. **Heute Abend:** Alle 22 fehlenden Header ergänzen
3. **Morgen:** Aufteilung von formbuilder.mdc beginnen
4. **Diese Woche:** Alle überlangen Dateien aufteilen
5. **Nächste Woche:** Strukturreorganisation durchführen

**Soll ich mit Phase 1 beginnen und die ersten YAML-Header hinzufügen?** 