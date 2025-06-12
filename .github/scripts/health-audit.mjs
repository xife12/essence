// 📁 .github/scripts/health-audit.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

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

// 🧬 SUPABASE SCHEMA PRÜFUNG
async function fetchSupabaseTables() {
  const url = process.env.SUPABASE_API_URL;
  const key = process.env.SUPABASE_API_KEY;
  const schemaUrl = `${url}/rest/v1/?apikey=${key}`;

  try {
    const res = await fetch(`${url}/rest/v1/tables`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.map(t => t.name);
  } catch (e) {
    console.error('Supabase-Schema konnte nicht geladen werden:', e);
    return [];
  }
}

const files = getAllMDCFiles(RULES_DIR);
const results = files.map(parseMDC);

const tooLong = results.filter(r => r.lines > 300);
const missingMeta = results.filter(r => !r.description || !r.globs);
const ruleNames = files.map(f => path.basename(f).replace('.mdc', '').toLowerCase());

// 🔄 Platzhalterdaten (bis Live-Vergleiche automatisch integriert sind)
const duplikate = ruleNames.filter((v, i, a) => a.indexOf(v) !== i);
const verwaist = ['dashboard-export.mdc'];
const dbKonflikte = [];
const supabaseTables = await fetchSupabaseTables();

for (const table of supabaseTables) {
  const found = ruleNames.some(name => name.includes(table));
  if (!found) dbKonflikte.push(`${table} fehlt in .mdc-Dateien`);
}

const empfehlungen = [
  ...tooLong.map(t => `Regel zu lang → aufteilen: ${path.basename(t.file)}`),
  ...missingMeta.map(t => `Fehlende Metadaten: ${path.basename(t.file)}`),
  ...dbKonflikte.map(t => `Datenbankregel fehlt: ${t}`)
];

// 📝 Generiere Markdown Report
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
${[...new Set(duplikate)].map(f => `- ${f}`).join('\n') || '- Keine'}

### ⚠️ Aufspaltung empfohlen
${tooLong.map(f => `- ${path.basename(f.file)} (${f.lines} Zeilen)`).join('\n') || '- Keine'}

### ❗️ Verwaist
${verwaist.map(f => `- ${f}`).join('\n') || '- Keine'}

### 🧬 Datenbank nicht synchron
${dbKonflikte.map(f => `- ${f}`).join('\n') || '- Keine'}

---

## ✅ Empfehlungen (Cursor Agent)
${empfehlungen.map(e => `- [ ] ${e}`).join('\n') || '- Keine offenen Maßnahmen'}
`;

fs.writeFileSync(REPORT_PATH, report);
console.log(`✅ Health audit report erstellt: ${REPORT_PATH}`);