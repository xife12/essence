// Datei: .github/scripts/health-audit.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');

const RULE_PATH = path.join(ROOT, '.cursor/rules');
const REPORT_PATH = path.join(ROOT, 'audit/health-audit-report.md');

function findAllMDC(dir, collected = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) findAllMDC(res, collected);
    else if (entry.name.endsWith('.mdc')) collected.push(res);
  }
  return collected;
}

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

function generateReport() {
  const rules = findAllMDC(RULE_PATH).map(extractMetadata);
  const tooLong = rules.filter(r => r.length > 300);
  const missingMeta = rules.filter(r => !r.description || !r.globs);

  const report = [`# 🧠 MemberCore Health Audit – Stand: ${new Date().toISOString().split('T')[0]}`,
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

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, report.join('\n'), 'utf-8');
  console.log('✅ Health Audit Report erstellt:', REPORT_PATH);
}

generateReport();