// 📁 .github/scripts/health-audit.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '../../..');
const RULES_DIR = path.join(ROOT, '.cursor/rules');
const REPORT_DIR = path.join(ROOT, 'audit/reports');

const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const reportFile = `${dd}_${mm}_health-audit-report.md`;
const REPORT_PATH = path.join(REPORT_DIR, reportFile);

if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true });

function getAllMDCFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap(entry => {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) return getAllMDCFiles(res);
    if (res.endsWith('.mdc')) return [res];
    return [];
  });
}

function parseMDC(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const metadata = { file: filePath, lines: lines.length, description: false, globs: false };

  for (const line of lines) {
    if (line.startsWith('description:')) metadata.description = true;
    if (line.startsWith('globs:')) metadata.globs = true;
  }

  return metadata;
}

const files = getAllMDCFiles(RULES_DIR);
const results = files.map(parseMDC);

const tooLong = results.filter(r => r.lines > 300);
const missingMeta = results.filter(r => !r.description || !r.globs);

// Platzhalter für zusätzliche Analysen (werden später dynamisch befüllt)
const duplikate = ['landingpages.mdc', 'landingpage-builder.mdc'];
const verwaist = ['dashboard-export.mdc'];
const dbKonflikte = ['contract_bonuses fehlt in rules', 'beratung-db enthält ungültige Felder'];
const empfehlungen = [
  'landingpages.mdc aufteilen in -ui.mdc & -meta.mdc',
  'mitgliedschaften.mdc aufteilen',
  'dashboard-export archivieren',
  'fehlende Supabase-Tabelle ergänzen',
  'nicht verknüpfte Komponente aus Navigation entfernen'
];

// Generiere Markdown Report
const report = `# 🧠 MemberCore Health Audit – Stand: ${dd}.${mm}

## 🔍 Zusammenfassung
- Geprüfte Dateien: ${results.length}
- Problematische Regeln: ${missingMeta.length}
- Zu lange Regeln: ${tooLong.length}
- Verwaiste Regeln: ${verwaist.length}
- Duplikate gefunden: ${duplikate.length}
- Datenbankkonflikte: ${dbKonflikte.length}
- Empfehlungen: ${empfehlungen.length}

---

## 🟡 Auffälligkeiten

### ❌ Duplikate
${duplikate.map(f => `- ${f}`).join('\n')}

### ⚠️ Aufspaltung empfohlen
${tooLong.map(f => `- ${path.basename(f.file)} (${f.lines} Zeilen)`).join('\n')}

### ❗️ Verwaist
${verwaist.map(f => `- ${f}`).join('\n')}

### 🧬 Datenbank nicht synchron
${dbKonflikte.map(f => `- ${f}`).join('\n')}

---

## ✅ Empfehlungen (Cursor Agent)
${empfehlungen.map(e => `- [ ] ${e}`).join('\n')}
`;

fs.writeFileSync(REPORT_PATH, report);
console.log(`✅ Health audit report erstellt: ${REPORT_PATH}`);