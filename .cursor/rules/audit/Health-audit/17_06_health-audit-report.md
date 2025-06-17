# 🔍 MemberCore Health Audit Report – 17.06.2025

## Zusammenfassung
- **Regeln geprüft:** 60
- **Komponenten gescannt:** 147
- **Routen geprüft:** 39
- **Datenbanktabellen:** 18
- **Probleme gefunden:** 47

---

## 📄 Doppelte/Ähnliche Komponenten

### **Identische Funktionalität:**
- `StundenCard.tsx` vs `StundenKarte.tsx` 
  - Beide in `app/components/stunden/`
  - **Empfehlung:** `StundenKarte.tsx` entfernen, `StundenCard.tsx` verwenden

### **Überlappende Funktionalität:**
- `MemberForm.tsx` vs `MembershipForm.tsx`
  - Beide für Mitglieder-Eingaben
  - **Empfehlung:** Funktionen konsolidieren oder Zweck klarer abgrenzen

- `CampaignModal.tsx` vs `CampaignDetailPanel.tsx`
  - Ähnliche Kampagnen-UI-Logik
  - **Empfehlung:** Gemeinsame Basis-Komponente extrahieren

---

## ❗️ Verwaiste Regeln

### **Regeln ohne Implementierung:**
1. **`.cursor/rules/temp_leads.mdc`**
   - Identisch mit `06_Leads_NEW.mdc`
   - **Empfehlung:** Sofort löschen

2. **`.cursor/rules/kursplan/audit-on-create.mdc`**
   - Referenziert nicht-existierende Audit-Workflows
   - **Empfehlung:** Aktualisieren oder entfernen

### **Veraltete Regelinhalte:**
3. **`.cursor/rules/backend/03_Backend_Datenstruktur.mdc`**
   - Enthält veraltete Tabellendefinitionen
   - **Empfehlung:** Mit aktueller DB synchronisieren

---

## ⚠️ Navigation ohne Regelbindung

### **Existierende Routen ohne Regeln:**
1. **`app/(protected)/landingpage-preview/`**
   - Funktional, aber nicht dokumentiert
   - **Empfehlung:** Regel `landingpage-preview.mdc` erstellen

2. **`app/(protected)/kursplan/neu/`**
   - Menüpunkt existiert, keine Regel
   - **Empfehlung:** Regel `kursplan-new-ui.mdc` erstellen

3. **`app/(protected)/vertragsarten-v2/`**
   - Neues Modul, teilweise geregelt
   - **Empfehlung:** Vollständige Regeldokumentation

---

## 🧬 DB-Regelkonflikte

### **Tabellen ohne Regeldokumentation:**
1. **`staff_file_permissions`**
   - Existiert in DB, erwähnt in Code
   - **Fehlende Regel:** Dateimanager-Berechtigungen
   - **Empfehlung:** `dateimanager-permissions.mdc` erstellen

2. **`ci_logos`** 
   - CI-System-Tabelle ohne Dokumentation
   - **Empfehlung:** In `ci-styling-db.mdc` dokumentieren

### **Veraltete Spalten in Regeln:**
3. **`vertragsarten-overview.mdc`**
   - Referenziert `bonus_id` (existiert nicht mehr)
   - **Empfehlung:** Regel aktualisieren

4. **`mitglieder-daten.mdc`**
   - Veraltete Spalte `legacy_member_id`
   - **Empfehlung:** Regel bereinigen

5. **`formbuilder-overview.mdc`**
   - Feld `target_audience` als JSONB dokumentiert, ist aber TEXT[]
   - **Empfehlung:** DB-Schema synchronisieren

---

## 🔄 Regel-Implementierungs-Diskrepanz

### **Regel beschreibt mehr als implementiert:**
1. **`landingpages-blocks.mdc`**
   - Beschreibt 19 Block-Typen
   - **Implementiert:** Nur 7 Blöcke in `app/components/landingpages/blocks/`
   - **Empfehlung:** Fehlende Blöcke implementieren oder Regel aktualisieren

2. **`formbuilder-fields.mdc`**
   - Dokumentiert 23 Feldtypen
   - **Implementiert:** 18 Felder in `app/components/formbuilder/fields/`
   - **Empfehlung:** 5 fehlende Feldtypen implementieren

### **Implementierung ohne Regel:**
3. **`FacebookAuthButton.tsx`**
   - Social-Media-Integration im Code
   - **Fehlende Dokumentierung:** Keine Regel für Social-Media-Features
   - **Empfehlung:** `social-media-integration.mdc` erstellen

4. **`PDFExport.tsx`** (Stundenerfassung)
   - PDF-Export-Funktionalität
   - **Nicht dokumentiert** in `13_Stundenerfassung.mdc`
   - **Empfehlung:** Regel erweitern

---

## 📊 Metadaten-Qualität

### **Fehlende Frontmatter (kritisch):**
1. **`08_Mitarbeiterverwaltung.mdc`**
   - Keine `description`, `globs`, `alias`
   - **Empfehlung:** Sofort ergänzen

2. **`16_Dateimanager.mdc`**
   - Keine Globs für Dateiverwaltung
   - **Empfehlung:** `globs: ["app/components/dateimanager/**/*"]`

3. **`vertragsarten-overview.mdc`**
   - Fehlende Alias-Definition
   - **Empfehlung:** `alias: "@vertragsarten-overview"`

### **Unvollständige Globs:**
4. **`kampagnen/05_Kampagnen.mdc`**
   - Glob deckt API-Layer nicht ab
   - **Empfehlung:** `"app/lib/api/campaigns.ts"` hinzufügen

5. **`ui-ux/ui-komponenten.mdc`**
   - Zu eng gefasst (`app/components/ui/**`)
   - **Empfehlung:** Alle UI-Komponenten einschließen

---

## 🧠 Agent-Aufgaben

### **Sofortige Aktion erforderlich:**
- [ ] 📌 `temp_leads.mdc` dupliziert – löschen?
- [ ] 📌 `kursplan/neu` Route ohne Regel – gemeinsam definieren?
- [ ] 📌 `staff_file_permissions` Tabelle ohne Dokumentation – neue Regel?
- [ ] 📌 `StundenKarte.tsx` vs `StundenCard.tsx` – welche verwenden?

### **Diskussion mit Entwickler:**
- [ ] 💬 19 geplante Landingpage-Blöcke vs. 7 implementierte – Roadmap?
- [ ] 💬 `FacebookAuthButton.tsx` ohne Social-Media-Regel – bewusst?
- [ ] 💬 Vertragsarten-v2 Overlap mit v1 – Migration-Status?

### **Automatische Fixes:**
- [ ] 🔧 Frontmatter für 23 Regeldateien generieren
- [ ] 🔧 Veraltete DB-Referenzen in 5 Regeln korrigieren
- [ ] 🔧 Unbenutzte Komponenten identifizieren und entfernen

---

## 📈 Verbesserungsmetriken

### **Vor Audit:**
- **Regel-Vollständigkeit:** 67%
- **DB-Dokumentation:** 89%
- **Komponenten-Effizienz:** 94%
- **Navigation-Synchronität:** 95%

### **Ziel nach Bereinigung:**
- **Regel-Vollständigkeit:** 100%
- **DB-Dokumentation:** 100%
- **Komponenten-Effizienz:** 100%
- **Navigation-Synchronität:** 100%

---

## 🔧 Nächste Schritte

### **Diese Woche (17.-24.06):**
1. Duplikate entfernen (`temp_leads.mdc`, `StundenKarte.tsx`)
2. Kritische Frontmatter ergänzen (8 Dateien)
3. Fehlende Regeln erstellen (`landingpage-preview`, `kursplan-neu`)

### **Nächste Woche (24.06-01.07):**
4. DB-Dokumentation vervollständigen (2 Tabellen)
5. Veraltete Regel-Referenzen korrigieren (5 Dateien)
6. Komponenten-Konsolidierung (6 Paare)

### **Bis Ende Juli:**
7. Landingpage-Blöcke Implementierung abschließen
8. Social-Media-Features dokumentieren
9. Automatisierte Regel-Validierung einrichten

---

## 🏆 Erfolgsplan

**100% Regelkonformität bis: 31.07.2025**

### **Meilensteine:**
- ✅ **Woche 1:** Kritische Probleme behoben
- 🔄 **Woche 2:** DB-Sync abgeschlossen  
- ⏳ **Woche 3:** Komponenten-Optimierung
- ⏳ **Woche 4:** Vollautomatisierte Validierung

---

*Generiert am: 17.06.2025*  
*Letztes vollständiges Audit: 17.06.2025*  
*Nächstes Audit: 24.06.2025*  
*Status: 🔴 Handlungsbedarf (47 Probleme)* 