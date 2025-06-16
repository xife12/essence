# 🚀 Quick Start: Vertragsarten V2 mit Supabase

## ⚡ 5-Minuten Setup

### 1. Supabase Projekt erstellen
```bash
# 1. Gehe zu https://app.supabase.com
# 2. Erstelle neues Projekt oder nutze bestehendes
# 3. Notiere dir: Project URL und anon key
```

### 2. Umgebungsvariablen setzen
```bash
# .env.local erstellen/erweitern
echo "NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co" >> .env.local
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key" >> .env.local
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key" >> .env.local
```

### 3. One-Click Installation
```bash
# Alles in einem Befehl:
npm run v2:install
```

**Das war's! 🎉**

### 4. System starten
```bash
# Entwicklungsserver starten
npm run v2:dev

# Browser öffnen
open http://localhost:3000/vertragsarten-v2
```

---

## 🔧 Einzelne Schritte (falls nötig)

### Dependencies installieren
```bash
npm run setup:dependencies
```

### Supabase konfigurieren
```bash
npm run setup:supabase
```

### Datenbank prüfen
```bash
npm run v2:test
```

### Bei Problemen: Reset
```bash
npm run db:reset
npm run db:migrate
npm run db:seed
```

---

## ✅ Erfolgskontrolle

Nach dem Setup solltest du folgendes sehen:

**Terminal:**
```bash
✅ Schema-Migration erfolgreich
✅ 9 aktive Kategorien gefunden  
✅ API-Layer vorhanden
✅ Frontend-Pages vorhanden
🎉 Supabase Integration Setup abgeschlossen!
```

**Browser (http://localhost:3000/vertragsarten-v2):**
- 📋 Verträge-Tab mit Übersicht
- 🧩 Module-Tab mit 9 Kategorien
- 📄 Dokumente-Tab

---

## 🆘 Troubleshooting

**Problem: Migration fehlgeschlagen**
```bash
supabase db reset
npm run setup:supabase
```

**Problem: Tabellen nicht gefunden**
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
npm run db:migrate
```

**Problem: RLS Policy Fehler**
```bash
# In Supabase Dashboard → SQL Editor:
SELECT auth.jwt() ->> 'role';
# Sollte 'admin' oder 'studioleiter' zurückgeben
```

**Problem: Frontend lädt nicht**
```bash
# .env.local prüfen:
cat .env.local | grep SUPABASE
# URLs müssen korrekt sein
```

---

## 🎯 Nächste Schritte

1. **Ersten Vertrag erstellen**: `/vertragsarten-v2/contracts/neu`
2. **Module konfigurieren**: `/vertragsarten-v2/modules/neu`  
3. **Dokument-Templates**: `/vertragsarten-v2/documents/neu`
4. **Kampagnen verknüpfen**: In Kampagnen-Modul

---

**🚀 Viel Erfolg mit dem neuen Vertragsarten-System!**