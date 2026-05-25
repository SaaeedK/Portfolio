/* eslint-env node */
/**
 * One-off generator for public/resume.pdf (valid PDF, redacted contact details).
 * Run: node scripts/generate-resume-pdf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'public', 'resume.pdf');

const lines = [
  'Saaeed Khan',
  'Security Engineer',
  'United States',
  '',
  'Education and experience: see portfolio timeline (demo content).',
  '',
  'Skills: Security engineering, SIEM, cloud security, automation.',
  '',
  'Reach me via the portfolio contact form or LinkedIn.',
  'LinkedIn: linkedin.com/in/saaeed-khan',
  'GitHub: github.com/SaaeedK',
  '',
  'This PDF excludes email, phone, and street address.',
];

function pdfEscape(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

const contentLines = ['BT', '/F1 14 Tf', '72 720 Td'];
lines.forEach((line, i) => {
  if (i > 0) contentLines.push('0 -18 Td');
  contentLines.push(`(${pdfEscape(line)}) Tj`);
});
contentLines.push('ET');
const stream = `${contentLines.join('\n')}\n`;
const streamLen = Buffer.byteLength(stream, 'utf8');

const body = [
  '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
  '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
  '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n',
  `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${stream}endstream\nendobj\n`,
  '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
].join('');

const header = '%PDF-1.4\n';
const offsets = [0];
let pos = Buffer.byteLength(header, 'utf8');
for (const part of body.match(/(\d+ 0 obj[\s\S]*?endobj\n)/g) ?? []) {
  offsets.push(pos);
  pos += Buffer.byteLength(part, 'utf8');
}

const xrefOffset = Buffer.byteLength(header + body, 'utf8');
let pdf = header + body;
pdf += 'xref\n0 6\n';
pdf += '0000000000 65535 f \n';
for (let i = 1; i <= 5; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
pdf += 'trailer\n<< /Size 6 /Root 1 0 R >>\n';
pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

fs.writeFileSync(outPath, pdf, 'utf8');
const head = fs.readFileSync(outPath).subarray(0, 5).toString('utf8');
if (!head.startsWith('%PDF-')) {
  throw new Error('Generated file is not a valid PDF header');
}
console.log(`Wrote ${outPath} (${fs.statSync(outPath).size} bytes)`);
