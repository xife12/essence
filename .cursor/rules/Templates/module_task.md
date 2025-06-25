---
description: "Taskmaster-kompatibles Template für Modul-Tasks mit PRD-Referenz und Memory Bank Integration"
globs: 
  - ".cursor/rules/**/tasks/*.md"
  - ".taskmaster/tasks/*.md"
alwaysApply: true
dependencies:
  - "@task-flow"
  - "@audit-rules"
---

# Task für {{modulename}}

## 📋 PRD Reference
**Business Context:** Link zu relevanten PRD-Abschnitten  
**User Story:** Als [Benutzertyp] möchte ich [Ziel] um [Nutzen] zu erreichen  
**Business Value:** Welches Problem löst dieses Modul?

## 🎯 Akzeptanzkriterien
- [ ] Funktionale Anforderungen vollständig erfüllt
- [ ] UI/UX entspricht Design-Vorgaben  
- [ ] API-Endpunkte dokumentiert und getestet
- [ ] Sicherheit (RLS, Input-Validation) implementiert
- [ ] Performance-Anforderungen erfüllt
- [ ] Mobile-Responsivität gewährleistet
- [ ] Accessibility Standards (AA) eingehalten
- [ ] Documentation vollständig (technisch + benutzer)

## 🔗 Abhängigkeits-Matrix
**Dependencies:** {{dependencies}}

### Blocking (müssen zuerst fertig sein):
- [ ] Modul XYZ muss vorgezogen werden
- [ ] Schnittstelle mit ABC muss definiert sein
- [ ] Database Schema für {{modulename}} muss existieren

### Blocked (warten auf dieses Modul):
- [ ] Modul DEF wartet auf {{modulename}} API
- [ ] Integration Tests können erst nach {{modulename}} laufen

### Parallel (können gleichzeitig entwickelt werden):
- [ ] UI-Komponenten und API können parallel entwickelt werden
- [ ] Documentation kann parallel zur Implementation erfolgen

## 📊 Komplexität & Aufwand
**Komplexität:** ⭐⭐⭐☆☆ (3/5)
- ☐ 1 - Trivial (< 2h)
- ☐ 2 - Einfach (2-4h)  
- ☐ 3 - Mittel (0.5-1 Tag)
- ☐ 4 - Komplex (1-3 Tage)
- ☐ 5 - Sehr komplex (3+ Tage)

**Geschätzter Aufwand:** {{hours}} Stunden / {{days}} Tage  
**Risiko-Level:** {{low/medium/high}}  
**Kritischer Pfad:** ☐ Ja ☐ Nein

## 🧱 Priorität & Scheduling
- [ ] 🔴 Critical - Blocker für andere Module
- [ ] 🟠 High - Wichtig für MVP
- [ ] 🟡 Medium - Nice-to-have für MVP
- [ ] 🟢 Low - Post-MVP Feature

**Sprint Assignment:** Sprint {{number}}  
**Assignee:** {{developer}}  
**Due Date:** {{date}}

## 🧠 Research-Backed Subtasks
*(Von Taskmaster AI generiert basierend auf aktuellen Best Practices)*

### 🏗️ Architektur & Setup
- [ ] Database Schema definieren (Tabellen, Relations, RLS)
- [ ] API-Endpunkte spezifizieren (REST/GraphQL)
- [ ] TypeScript Types generieren
- [ ] Error Handling Strategy festlegen

### 💻 Backend Implementation  
- [ ] Supabase Database Migrations erstellen
- [ ] API Routes implementieren (`lib/api/{{modulename}}.ts`)
- [ ] Business Logic entwickeln
- [ ] Input Validation & Sanitization
- [ ] RLS Policies konfigurieren
- [ ] Rate Limiting implementieren

### 🎨 Frontend Implementation
- [ ] UI-Komponenten erstellen (`components/{{modulename}}/`)
- [ ] State Management einrichten (Context/Zustand)
- [ ] Forms & Validation (Client-side)
- [ ] Loading States & Error Handling
- [ ] Responsive Design implementieren
- [ ] Accessibility Features (ARIA, Keyboard Navigation)

### 🧪 Testing & QA
- [ ] Unit Tests für API Functions
- [ ] Integration Tests für Database Queries  
- [ ] Component Tests (React Testing Library)
- [ ] E2E Tests für kritische User Flows
- [ ] Performance Testing (Page Load, API Response)
- [ ] Security Testing (SQL Injection, XSS)

### 📚 Documentation
- [ ] API Documentation (OpenAPI/Swagger)
- [ ] Component Documentation (Storybook)
- [ ] User Documentation für Endnutzer
- [ ] Developer Documentation (Setup, Troubleshooting)
- [ ] Migration Guide (wenn Breaking Changes)

### 🔗 Integration & Deployment
- [ ] Integration mit abhängigen Modulen testen
- [ ] Staging Deployment & Testing
- [ ] Production Deployment Checklist
- [ ] Monitoring & Alerting einrichten
- [ ] Performance Monitoring konfigurieren

## 📈 Progress Tracking
- [ ] 📋 **Planning Phase** (0-10%)
  - Requirements Analysis
  - Technical Design
  - Task Breakdown
- [ ] 🏗️ **Setup Phase** (10-20%)  
  - Database Schema
  - Basic API Structure
  - Project Scaffolding
- [ ] 💻 **Development Phase** (20-80%)
  - Backend Implementation
  - Frontend Implementation  
  - Basic Testing
- [ ] 🧪 **Testing Phase** (80-95%)
  - Comprehensive Testing
  - Bug Fixes
  - Performance Optimization
- [ ] 📚 **Documentation Phase** (95-98%)
  - Code Documentation
  - User Documentation
  - API Documentation
- [ ] 🚀 **Integration Phase** (98-100%)
  - Integration Testing
  - Deployment
  - Monitoring Setup

## 📝 Implementation Notes
**Technical Decisions:**
- Framework/Library Choices: {{choices}}
- Performance Considerations: {{considerations}}
- Security Measures: {{measures}}

**Known Issues/Limitations:**
- {{issue1}}
- {{issue2}}

**Future Enhancements:**
- {{enhancement1}}
- {{enhancement2}}

---

## 🔗 Links & References
- **Modul-Datei:** `.cursor/rules/{{modulename}}/{{modulename}}.mdc`
- **API Documentation:** `lib/api/{{modulename}}.ts`
- **Components:** `app/components/{{modulename}}/`
- **Pages:** `app/(protected)/{{modulename}}/`
- **Memory Bank:** `memory-bank/activeContext.md`
- **Taskmaster Tasks:** `.taskmaster/tasks.json` (wenn verfügbar)

---

## 🎯 Success Metrics
- [ ] Feature funktioniert fehlerfrei in allen Browser/Devices
- [ ] Performance Standards erfüllt (Core Web Vitals)
- [ ] Security Audit bestanden
- [ ] User Acceptance Testing erfolgreich
- [ ] Code Review approved
- [ ] Documentation complete and reviewed
- [ ] **Health Score:** Target 95+ /100

---

**Status:** ⏳ Not Started | 🟡 In Progress | ✅ Complete | ❌ Blocked  
**Last Updated:** {{timestamp}}  
**Next Review:** {{next_review_date}}
