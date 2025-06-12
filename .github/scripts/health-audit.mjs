// Datei: .github/scripts/health-audit.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const RULE_PATH = path.join(ROOT, '.cursor/rules');

// 📁 Ziel: audit/reports/TT_MM_health-audit-report.md
const today = new Date();
const dd = String(today.getDate()).padStart(2, '0');
const mm = String(today.getMonth() + 1).padStart(2, '0');
const filename = `${dd}_${mm}_health-audit-report.md`;
const REPORT_PATH = path.join(ROOT, 'audit/reports', filename);

// 🔍 Rule-Files finden
function findAllMDC(dir, collected = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) findAllMDC(res, collected);
    else if (entry.name.endsWith('.mdc')) collected.push(res);
  }
  return collected;
}

// 🔎 Metadaten extrahieren
function extractMetadata(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const metadata = { path: filepath };
  for (const line of lines) {
    if (line.startsWith('description:')) metadata.description = line.replace('description:', '').trim();
    if (line.startsWith('globs:')) metadata.globs = line.replace('globs:', '').trim();
    if (line.startsWith('alias:')) metadata.alias = line.replace('alias:', '').trim();
    if (line.trim() === '---') break;
  }
  metadata.length = lines.length;
  return metadata;
}

// 📋 Report erstellen
function generateMarkdownReport(rules) {
  const tooLong = rules.filter(r => r.length > 300);
  const missingMeta = rules.filter(r => !r.description || !r.globs);

  const lines = [
    `# 🧠 MemberCore Health Audit – Stand: ${dd}.${mm}`,
    '',
    `## 🔍 Zusammenfassung`,
    `- Geprüfte Regeln: ${rules.length}`,
    `- Zu lang (>300 Zeilen): ${tooLong.length}`,
    `- Fehlende Metadaten: ${missingMeta.length}`,
    '',
    '## 📄 Details zu auffälligen Regeln:',
    '',
    '### 📏 Zu lang:',
    ...tooLong.map(r => `- ${r.path} (${r.length} Zeilen)`),
    '',
    '### ❌ Fehlende Metadaten:',
    ...missingMeta.map(r => `- ${r.path}`)
  ];

  return lines.join('\n');
}

// 🧪 Lauf starten
function run() {
  const rules = findAllMDC(RULE_PATH).map(extractMetadata);
  const markdown = generateMarkdownReport(rules);

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, markdown, 'utf-8');

  console.log('✅ Health Audit gespeichert unter:', REPORT_PATH);
}

run();