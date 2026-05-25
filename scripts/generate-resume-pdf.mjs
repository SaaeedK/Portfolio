/* eslint-env node */
/**
 * Generates public/resume.pdf — redacted (no email, phone, or street address).
 * Run: node scripts/generate-resume-pdf.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'public', 'resume.pdf');

const PAGE = { width: 612, height: 792 };
const MARGIN = 50;
const CONTENT_WIDTH = PAGE.width - MARGIN * 2;

const COLORS = {
  text: rgb(0.12, 0.14, 0.16),
  muted: rgb(0.35, 0.38, 0.42),
  accent: rgb(0.05, 0.35, 0.42),
  rule: rgb(0.75, 0.78, 0.8),
};

/** @param {string} text */
function wrapText(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const trial = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(trial, size) <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function main() {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  let page = doc.addPage([PAGE.width, PAGE.height]);
  let y = PAGE.height - MARGIN;

  const ensureSpace = (needed) => {
    if (y - needed < MARGIN) {
      page = doc.addPage([PAGE.width, PAGE.height]);
      y = PAGE.height - MARGIN;
    }
  };

  const drawLine = (x1, x2, thickness = 0.75) => {
    page.drawLine({
      start: { x: x1, y },
      end: { x: x2, y },
      thickness,
      color: COLORS.rule,
    });
    y -= 10;
  };

  const drawText = (text, { size = 9, bold = false, oblique = false, color = COLORS.text, x = MARGIN, maxWidth = CONTENT_WIDTH, lineGap = 2 } = {}) => {
    const font = bold ? fontBold : oblique ? fontOblique : fontRegular;
    const lines = wrapText(text, font, size, maxWidth);
    const lineHeight = size + lineGap;
    ensureSpace(lines.length * lineHeight);
    for (const line of lines) {
      page.drawText(line, { x, y: y - size, size, font, color });
      y -= lineHeight;
    }
  };

  const sectionTitle = (title) => {
    ensureSpace(28);
    y -= 6;
    drawText(title, { size: 10, bold: true, color: COLORS.accent });
    y -= 2;
    drawLine(MARGIN, PAGE.width - MARGIN);
  };

  const roleBlock = (company, location, title, dates) => {
    ensureSpace(36);
    drawText(company, { size: 10, bold: true });
    drawText(`${location}  |  ${title}  |  ${dates}`, { size: 8.5, color: COLORS.muted, lineGap: 4 });
  };

  const bullet = (text) => {
    const font = fontRegular;
    const size = 9;
    const bulletIndent = 14;
    const textWidth = CONTENT_WIDTH - bulletIndent;
    const lines = wrapText(text, font, size, textWidth);
    const lineHeight = size + 2;
    ensureSpace(lines.length * lineHeight + 2);
    for (let i = 0; i < lines.length; i++) {
      if (i === 0) {
        page.drawText('•', { x: MARGIN + 2, y: y - size, size: 10, font: fontBold, color: COLORS.accent });
      }
      page.drawText(lines[i], { x: MARGIN + bulletIndent, y: y - size, size, font, color: COLORS.text });
      y -= lineHeight;
    }
    y -= 2;
  };

  // --- Header ---
  drawText('Saaeed Khan', { size: 22, bold: true, lineGap: 4 });
  drawText('Cybersecurity & Information Technology Professional', { size: 10, oblique: true, color: COLORS.muted, lineGap: 6 });
  drawText('U.S. Security Clearance: Eligible', { size: 9, bold: true, color: COLORS.accent, lineGap: 8 });
  drawLine(MARGIN, PAGE.width - MARGIN);
  drawText('Contact via portfolio form or LinkedIn — github.com/SaaeedK  |  linkedin.com/in/saaeed-khan', {
    size: 8,
    color: COLORS.muted,
    lineGap: 10,
  });

  // --- EDUCATION ---
  sectionTitle('EDUCATION');
  drawText('George Mason University', { size: 10, bold: true });
  drawText('Fairfax, VA', { size: 9, color: COLORS.muted, lineGap: 2 });
  drawText('Bachelor of Science in Information Technology, Concentration in Cybersecurity  |  May 2026', {
    size: 9,
    lineGap: 4,
  });
  bullet("Honors: Dean's List (Spring 2024 – Spring 2026)");
  bullet(
    'Relevant Coursework: Information Defense Technologies; Network Security; Security Administration of Linux Systems; Cybersecurity of Data & Software; Security Accreditation of Information Systems',
  );

  // --- EXPERIENCE ---
  sectionTitle('EXPERIENCE');
  roleBlock('DHL Global Forwarding', 'Sterling, VA', 'Air Export Specialist', 'January 2023 – Present');
  bullet(
    'Orchestrated 100+ international air freight shipments per month, maintaining full compliance with U.S. Customs AES filings and federal trade-control regulations.',
  );
  bullet(
    'Served as designated system superuser; trained 10+ team members on internal logistics platforms and reduced troubleshooting time by 30%.',
  );
  bullet(
    'Sustained operational KPIs above 95% compliance, validated quarterly through Control Tower audits, while supporting onboarding of 5+ enterprise clients.',
  );

  y -= 4;
  roleBlock('Worldwide Flight Services', 'Sterling, VA', 'Office Agent', 'May 2018 – September 2021');
  bullet(
    'Authored and verified 1,000+ bills of lading, reducing documentation discrepancies by 20% through tightened review controls.',
  );
  bullet(
    'Processed clearances with local, state, and federal agencies, sustaining 100% regulatory compliance across all shipment cycles.',
  );

  // --- PROJECTS ---
  sectionTitle('PROJECTS');
  drawText('NG5 LMS Web Application  |  React, TypeScript, Firebase, OWASP, NIST  |  GMU IT 493 Capstone', {
    size: 9,
    bold: true,
    lineGap: 4,
  });
  bullet(
    'Architected a full-stack, agentic-AI-first learning management system delivering 12 production features including AI tutoring, voice-command interface, and an early-warning student-risk system.',
  );
  bullet(
    'Conducted an OWASP-aligned security audit that lifted application security score from 65% to 95%; engineered RBAC and XSS mitigations and validated FERPA compliance end to end as four-engineer Team Lead.',
  );

  y -= 2;
  drawText('Security+ AI Tracker  |  TypeScript, Firebase Cloud Functions, Google Gemini, YouTube Data API  |  Personal Project', {
    size: 9,
    bold: true,
    lineGap: 4,
  });
  bullet(
    'Engineered a unified Security+ study platform consolidating Professor Messer curriculum, TryHackMe and HackTheBox lab bridges, and AI-driven study insights into a single learner dashboard.',
  );
  bullet(
    'Deployed Google Gemini through server-side Cloud Functions under a zero-trust architecture, fully isolating API credentials and user data from the client surface.',
  );

  y -= 2;
  drawText('TryHackMe Penetration Testing Labs  |  Kali Linux, Parrot OS, Burp Suite, Hydra, Nmap  |  Personal Project', {
    size: 9,
    bold: true,
    lineGap: 4,
  });
  bullet(
    'Completed 30+ offensive-security labs spanning privilege escalation, web exploitation, and vulnerability analysis using Burp Suite, Hydra, and Nmap.',
  );

  y -= 2;
  drawText('Wireshark Network Analysis  |  Wireshark, TShark, tcpdump  |  Personal Project', {
    size: 9,
    bold: true,
    lineGap: 4,
  });
  bullet(
    'Dissected 1,000+ packets across TCP handshakes, DNS resolution, and HTTP traffic; surfaced 5+ traffic anomalies and improved baseline detection accuracy by 20%.',
  );

  // --- TECHNICAL SKILLS ---
  sectionTitle('TECHNICAL SKILLS');
  drawText(
    'Languages: Python, Java, C, C++, C#, JavaScript, TypeScript, SQL, HTML, Tailwind CSS',
    { size: 9, lineGap: 4 },
  );
  drawText(
    'Tools & Platforms: AWS EC2, Azure, Linux (Ubuntu, Kali, Parrot), Windows, VirtualBox, VMware, Git, Splunk, Wireshark, Burp Suite, Firebase, MySQL',
    { size: 9, lineGap: 4 },
  );
  drawText(
    'Security & Frameworks: OWASP Top 10, NIST RMF, FERPA, RBAC, Zero-Trust Architecture, Network Forensics, Vulnerability Assessment',
    { size: 9, lineGap: 4 },
  );

  const pdfBytes = await doc.save();
  fs.writeFileSync(outPath, pdfBytes);
  const head = fs.readFileSync(outPath).subarray(0, 5).toString('utf8');
  if (!head.startsWith('%PDF-')) {
    throw new Error('Generated file is not a valid PDF');
  }
  console.log(`Wrote ${outPath} (${pdfBytes.length} bytes, ${doc.getPageCount()} page(s))`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
