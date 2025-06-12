# 🏗️ LANDINGPAGE BUILDER - IMPLEMENTIERUNGS-ROADMAP

**Projekt:** MemberCore Landingpage Builder  
**Ziel:** Vollständiger visueller Page Builder mit 20+ Block-Typen  
**Timeline:** 4-6 Wochen  
**Status:** 🚀 STARTET JETZT  

---

## 📊 **ANFORDERUNGS-ANALYSE**

### **✅ Vorhandene Basis:**
- ✅ Landingpages Übersicht-Seite (`/landingpages/page.tsx`)
- ✅ Datenbank-Migration Files (`landingpages_migration_final.sql`)
- ✅ Testimonials-System (erweitert implementiert)
- ✅ File-Asset Integration (Versionierung)
- ✅ Navigation & Layout-Struktur

### **🎯 Zu implementierende Kernmodule:**
- 🔄 **Visual Builder System** - Drag & Drop Interface
- 🔄 **20+ Block-Typen** - Komplette Block-Library
- 🔄 **Live-Preview System** - Desktop/Mobile Toggle
- 🔄 **CI-Styling Integration** - Brand Guidelines
- 🔄 **Export & Publishing** - QR-Code, Live-Schaltung
- 🔄 **Template-System** - Vorgefertigte Page-Templates

---

## 🗺️ **DETAILLIERTE ROADMAP**

### **🎯 PHASE 1: INFRASTRUKTUR & API-LAYER (Woche 1)**

#### **1.1 Datenbank Setup & Migration**
- [ ] Datenbank-Migration ausführen (`landingpages_migration_final.sql`)
- [ ] RLS-Policies testen und vervollständigen
- [ ] Block-Type ENUMs erweitern (20+ Typen)
- [ ] Performance-Indizes erstellen

#### **1.2 API-Layer Entwicklung**
- [ ] `LandingpagesAPI` - CRUD für Landingpages
- [ ] `BlocksAPI` - Block-Management mit Position-Handling
- [ ] `TemplatesAPI` - Page & CI-Template Integration
- [ ] `PublishingAPI` - QR-Code & Live-Schaltung

#### **1.3 TypeScript Interfaces & Types**
- [ ] `LandingPage` Interface mit allen Feldern
- [ ] `BlockType` & `BlockConfig` Typen (20+ Varianten)
- [ ] `TemplateConfig` & `CIPreset` Interfaces
- [ ] `PublishingConfig` für QR & Analytics

---

### **🎨 PHASE 2: VISUAL BUILDER KERN-SYSTEM (Woche 2)**

#### **2.1 Builder Layout & Navigation**
- [ ] Split-View Layout (Block-Library | Canvas | Config)
- [ ] Builder-Navigation mit Tabs (Builder, Einstellungen, Vorschau)
- [ ] Responsive Builder-Interface
- [ ] Auto-Save Funktionalität

#### **2.2 Drag & Drop Infrastructure**
- [ ] React DnD Setup für Builder
- [ ] Drop-Zones mit Visual Feedback
- [ ] Block-Position Management
- [ ] Reorder & Delete Funktionen

#### **2.3 Block-Management System**
- [ ] Block-Factory für dynamische Erstellung
- [ ] Position-based Rendering
- [ ] Block-Selection & Highlighting
- [ ] Undo/Redo Funktionalität (Basis)

---

### **🧱 PHASE 3: BLOCK-LIBRARY IMPLEMENTIERUNG (Woche 3-4)**

#### **3.1 Content Blocks (Woche 3.1)**
- [ ] **Header-Block** - 5 Presets (Hero Centered, Split, Overlay, etc.)
- [ ] **Text-Block** - 5 Presets (Classic, Two-Column, Quote, etc.)
- [ ] **Image-Block** - 5 Presets (Grid, Carousel, Banner, etc.)
- [ ] **Video-Block** - 5 Presets (Clean, Framed, Split, etc.)

#### **3.2 Interactive Blocks (Woche 3.2)**
- [ ] **Button-Block** - 5 Presets (Flat, Rounded, Ghost, etc.)
- [ ] **Form-Block** - Integration mit Formbuilder
- [ ] **Icon-Block** - 5 Presets (Grid, Row, Badge, etc.)
- [ ] **Testimonial-Block** - Integration mit Testimonials-System

#### **3.3 Functional Blocks (Woche 4.1)**
- [ ] **Pricing-Block** - Vertragsarten-Integration
- [ ] **Feature-Block** - USP-Darstellung
- [ ] **Countdown-Block** - Kampagnen-Integration
- [ ] **Service-Block** - Dienstleistungen-Anzeige

#### **3.4 Advanced Blocks (Woche 4.2)**
- [ ] **FAQ-Block** - Accordion-System
- [ ] **Contact-Block** - Map-Integration
- [ ] **Team-Block** - Mitarbeiter-Integration
- [ ] **Statistics-Block** - Erfolgszahlen
- [ ] **Trust-Logos-Block** - Partner-Logos
- [ ] **Gallery-Block** - Lightbox-System

---

### **🎭 PHASE 4: STYLING & CI-INTEGRATION (Woche 5)**

#### **4.1 CI-Preset Integration**
- [ ] CI-Template Auswahl-Interface
- [ ] Globale Farb-/Font-Anwendung
- [ ] Button-Style Übernahme
- [ ] Brand-Logo Integration

#### **4.2 Block-Preset System**
- [ ] Preset-Bibliothek für jeden Block-Typ
- [ ] Visual Preset-Preview
- [ ] Preset-Wechsel ohne Inhaltsverlust
- [ ] Custom-Preset Erstellung

#### **4.3 Responsive Design System**
- [ ] Mobile/Tablet/Desktop Layout-Variants
- [ ] Responsive Preview-Toggle
- [ ] Device-specific Optimierungen
- [ ] Touch-friendly Builder-Controls

---

### **👁️ PHASE 5: PREVIEW & PUBLISHING (Woche 6)**

#### **5.1 Live-Preview System**
- [ ] Real-time Preview-Rendering
- [ ] Device-Toggle (Desktop/Tablet/Mobile)
- [ ] Interactive Preview (Forms, Buttons)
- [ ] Performance-optimierte Rendering

#### **5.2 Publishing & Export**
- [ ] Live-Schaltung Workflow
- [ ] QR-Code automatische Generierung
- [ ] Meta-Tags & SEO-Optimierung
- [ ] Analytics-Pixel Integration

#### **5.3 Template-System**
- [ ] Page-Template Erstellung aus bestehenden Pages
- [ ] Template-Bibliothek mit Kategorien
- [ ] One-Click Template-Anwendung
- [ ] Template-Sharing zwischen Kampagnen

---

## 🛠️ **TECHNISCHE ARCHITEKTUR**

### **Frontend-Komponenten**
```
landingpages/
├── [id]/
│   ├── builder/
│   │   ├── page.tsx                    # Main Builder Interface
│   │   │   ├── components/
│   │   │   │   ├── BuilderLayout.tsx       # Split-View Layout
│   │   │   │   ├── BlockLibrary.tsx        # 20+ Block Types
│   │   │   │   ├── Canvas.tsx              # Drag & Drop Area
│   │   │   │   ├── ConfigPanel.tsx         # Block Configuration
│   │   │   │   └── PreviewToggle.tsx       # Device Preview
│   │   │   └── blocks/
│   │   │       ├── ContentBlocks/          # Header, Text, Image, Video
│   │   │       ├── InteractiveBlocks/      # Button, Form, Icon
│   │   │       ├── FunctionalBlocks/       # Pricing, Feature, Countdown
│   │   │       └── AdvancedBlocks/         # FAQ, Contact, Team, etc.
│   │   ├── preview/
│   │   │   └── page.tsx                    # Live Preview Page
│   │   ├── settings/
│   │   │   └── page.tsx                    # SEO, CI, Publishing
│   │   └── analytics/
│   │       └── page.tsx                    # Performance & Conversion
│   ├── templates/
│   │   └── page.tsx                        # Template Management
│   └── components/
│       ├── Builder/                        # Builder-specific Components
│       ├── Blocks/                         # Reusable Block Components
│       └── Preview/                        # Preview & Rendering
```

### **API-Struktur**
```
lib/api/
├── landingpages.ts                     # Main CRUD Operations
├── blocks.ts                           # Block Management
├── templates.ts                        # Template Operations
├── publishing.ts                       # QR-Code, Live Publishing
└── analytics.ts                        # Performance Tracking
```

### **Datenbank-Integration**
- **Tabellen:** `landingpage`, `landingpage_block`, `page_templates`, `ci_templates`
- **Block-Storage:** JSONB für flexible Konfiguration
- **Performance:** Optimierte Indizes für Block-Loading
- **Versionierung:** Git-ähnliches System für Page-Versions

---

## 🎯 **BLOCK-TYPEN SPEZIFIKATION**

### **Content Blocks (4 Typen)**
1. **Header** - Hero Sections mit Bild/Text/CTA
2. **Text** - Richtext mit verschiedenen Layouts
3. **Image** - Galerie, Banner, Lightbox
4. **Video** - YouTube/Vimeo Integration

### **Interactive Blocks (4 Typen)**
5. **Button** - CTA-Buttons mit verschiedenen Styles
6. **Form** - Formbuilder-Integration
7. **Icon** - Icon-Grids mit Beschreibungen
8. **Testimonial** - Kundenbewertungen Carousel

### **Functional Blocks (8 Typen)**
9. **Pricing** - Tarif-Vergleich aus Vertragsarten
10. **Feature** - USP/Vorteile-Auflistung
11. **Countdown** - Kampagnen-Timer
12. **Service** - Dienstleistungs-Übersicht
13. **FAQ** - Expandable Q&A Sections
14. **Contact** - Kontakt mit Map-Integration
15. **Team** - Mitarbeiter-Präsentation
16. **Courseplan** - Kursplan-Integration

### **Advanced Blocks (4 Typen)**
17. **Statistics** - Erfolgszahlen animated
18. **Trust-Logos** - Partner/Zertifikat-Logos
19. **Gallery** - Image-Gallery mit Lightbox
20. **Blog-Preview** - Content-Teaser (vorbereitet)

---

## 📊 **ERFOLGS-METRIKEN**

### **Technische KPIs**
- [ ] **Performance:** < 2s Page-Load Zeit
- [ ] **Mobile:** 100% Responsive Design
- [ ] **Accessibility:** WCAG 2.1 AA konform
- [ ] **SEO:** Meta-Tags & Structured Data

### **Business KPIs**
- [ ] **Builder-Effizienz:** Page-Erstellung < 30 Minuten
- [ ] **Template-Wiederverwendung:** > 50% Template-based Pages
- [ ] **Conversion-Tracking:** Integrierte Analytics
- [ ] **Multi-Campaign:** Campaign-übergreifende Templates

### **User Experience KPIs**
- [ ] **Intuitive Bedienung:** Drag & Drop ohne Training
- [ ] **Live-Preview:** Real-time Änderungen sichtbar
- [ ] **Device-Kompatibilität:** Identische UX auf allen Geräten
- [ ] **Performance:** Keine wahrnehmbare Ladezeiten

---

## ⚡ **QUICK-START PLAN**

### **Sofortiger Start (Heute):**
1. **Datenbank-Migration** ausführen
2. **Builder-Routing** erstellen (`/landingpages/[id]/builder`)
3. **Basis API-Layer** implementieren
4. **Erstes Block-System** (Header-Block) als Proof-of-Concept

### **Diese Woche:**
- **Drag & Drop Infrastructure** mit React DnD
- **3-4 Basis-Blocks** (Header, Text, Image, Button)
- **Live-Preview** Grundsystem
- **Block-Configuration** Panel

### **Nächste Woche:**
- **10+ weitere Block-Typen** implementieren
- **CI-Styling Integration** beginnen
- **Template-System** Basis
- **Publishing-Workflow** entwickeln

---

## 🚀 **NÄCHSTE SCHRITTE**

1. **✅ JETZT:** Datenbank-Migration und API-Grundlage
2. **✅ TAG 1:** Builder-Layout und Drag & Drop Setup
3. **✅ TAG 2-3:** Erste 4 Block-Typen implementieren
4. **✅ WOCHE 1:** Builder MVP mit Live-Preview
5. **✅ WOCHE 2:** Komplette Block-Library
6. **✅ WOCHE 3:** CI-Integration und Publishing

**ZIEL:** Vollständiger, produktionsreifer Landingpage Builder in 4-6 Wochen!

---

*Erstellt: 12. Juni 2025*  
*Status: 🎯 READY TO START*  
*Next Action: Datenbank-Migration & API-Setup* 