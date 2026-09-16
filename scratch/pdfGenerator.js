const fs = require('fs');
const path = require('path');

function createPdf(docInfo) {
  const {
    title,
    projectCode,
    ministry,
    executingAgency,
    sanctionedCost,
    lengthScope,
    sanctionDate,
    targetDate,
    status,
    description,
  } = docInfo;

  // Stream content using standard PDF text and drawing operators
  const lines = [
    // Header background bar (Tricolor subtle accents)
    '0.059 0.133 0.239 rg', // #0F223D dark blue
    '30 790 535 26 re f',
    
    // Header title
    'BT',
    '/F1 11 Tf',
    '1 1 1 rg', // White text
    '42 800 Td',
    '(GOVERNMENT OF INDIA  |  PROJECTSETU INFRASTRUCTURE MONITORING) Tj',
    'ET',

    // Saffron and Green decorative lines
    '1 0.6 0.2 rg', // Saffron
    '30 786 267 3 re f',
    '0.075 0.533 0.031 rg', // Green
    '297 786 268 3 re f',

    // Document Title
    'BT',
    '/F1 16 Tf',
    '0.059 0.133 0.239 rg',
    '30 750 Td',
    `(${escapePdf(title)}) Tj`,
    'ET',

    // Subtitle
    'BT',
    '/F2 10 Tf',
    '0.3 0.3 0.3 rg',
    '30 735 Td',
    '(DETAILED PROJECT REPORT \\(SANCTIONED DPR\\) - OFFICIAL RECORD) Tj',
    'ET',

    // Horizontal line
    '0.8 0.8 0.8 RG',
    '1 w',
    '30 720 m 565 720 l S',

    // Project Metadata Table Card
    '0.96 0.97 0.98 rg',
    '30 550 535 155 re f',
    '0.85 0.88 0.92 RG',
    '30 550 535 155 re S',

    // Metadata entries
    'BT',
    '/F1 9 Tf',
    '0.1 0.15 0.25 rg',
    '45 685 Td', '(Project Title:) Tj',
    '140 0 Td', `/F2 9 Tf (${escapePdf(title)}) Tj`,
    '-140 -20 Td', '/F1 9 Tf (Ministry / Dept:) Tj',
    '140 0 Td', `/F2 9 Tf (${escapePdf(ministry)}) Tj`,
    '-140 -20 Td', '/F1 9 Tf (Executing Agency:) Tj',
    '140 0 Td', `/F2 9 Tf (${escapePdf(executingAgency)}) Tj`,
    '-140 -20 Td', '/F1 9 Tf (Sanctioned Budget:) Tj',
    '140 0 Td', `/F2 9 Tf (${escapePdf(sanctionedCost)}) Tj`,
    '-140 -20 Td', '/F1 9 Tf (Project Length / Scope:) Tj',
    '140 0 Td', `/F2 9 Tf (${escapePdf(lengthScope)}) Tj`,
    '-140 -20 Td', '/F1 9 Tf (Sanction Date:) Tj',
    '140 0 Td', `/F2 9 Tf (${escapePdf(sanctionDate)}) Tj`,
    '-140 -20 Td', '/F1 9 Tf (Target Completion:) Tj',
    '140 0 Td', `/F2 9 Tf (${escapePdf(targetDate)}) Tj`,
    'ET',

    // Section 1: Executive Summary Heading
    'BT',
    '/F1 11 Tf',
    '0.059 0.133 0.239 rg',
    '30 520 Td',
    '(1. EXECUTIVE SUMMARY & TECHNICAL APPRAISAL) Tj',
    'ET',

    // Section 1 Text
    'BT',
    '/F2 9.5 Tf',
    '0.2 0.2 0.2 rg',
    '30 500 Td',
    `(${escapePdf(description)}) Tj`,
    '0 -16 Td',
    '(The project has been appraised and cleared by the Public Investment Board \\(PIB\\) and the Cabinet) Tj',
    '0 -14 Td',
    '(Committee on Economic Affairs \\(CCEA\\). Environmental impact assessments, geotechnical surveys,) Tj',
    '0 -14 Td',
    '(and multimodal transit integration corridors have been verified and sanctioned.) Tj',
    'ET',

    // Section 2: Statutory Compliance & Sanction
    'BT',
    '/F1 11 Tf',
    '0.059 0.133 0.239 rg',
    '30 420 Td',
    '(2. STATUTORY SANCTIONS & STATUTORY CLEARANCES) Tj',
    'ET',

    'BT',
    '/F2 9.5 Tf',
    '0.2 0.2 0.2 rg',
    '30 400 Td',
    '(a\\) Land Acquisition & Right-of-Way \\(RoW\\): Cleared and gazetted in State & Central notifications.) Tj',
    '0 -15 Td',
    '(b\\) Environmental & Forest Clearance: Approved by Ministry of Environment, Forest & Climate Change.) Tj',
    '0 -15 Td',
    '(c\\) Funding & Equity Structure: 50:50 Joint Venture between Govt. of India and State Government.) Tj',
    '0 -15 Td',
    '(d\\) Safety Certification: Independent Safety Assessor \\(ISA\\) and CMRS/CRS inspection protocols aligned.) Tj',
    'ET',

    // Section 3: Public Grievance & Citizen Watch
    'BT',
    '/F1 11 Tf',
    '0.059 0.133 0.239 rg',
    '30 310 Td',
    '(3. CITIZEN OVERSIGHT & TRANSPARENCY PROTOCOL) Tj',
    'ET',

    'BT',
    '/F2 9 Tf',
    '0.25 0.25 0.25 rg',
    '30 290 Td',
    '(This document is published under the ProjectSetu National Transparency Initiative. Citizens may track) Tj',
    '0 -14 Td',
    '(real-time physical milestone telemetry, budget disbursements, and submit observations or grievances) Tj',
    '0 -14 Td',
    '(directly via the ProjectSetu Citizen Portal using the unique Project Reference identifier.) Tj',
    'ET',

    // Official Stamp / Signature Box
    '0.94 0.96 0.98 rg',
    '340 120 225 120 re f',
    '0.1 0.45 0.9 RG',
    '340 120 225 120 re S',

    'BT',
    '/F1 9 Tf',
    '0.1 0.3 0.7 rg',
    '355 215 Td',
    '(OFFICIALLY SANCTIONED & APPROVED) Tj',
    '/F2 8 Tf',
    '0.3 0.3 0.3 rg',
    '0 -16 Td',
    '(ProjectSetu Digital Repository - Govt of India) Tj',
    '0 -14 Td',
    `(${escapePdf(executingAgency)}) Tj`,
    '0 -14 Td',
    `(${escapePdf(sanctionDate)}) Tj`,
    '/F1 8 Tf',
    '0.075 0.533 0.031 rg',
    '0 -18 Td',
    '(AUTHENTICATED DPR RECORD #PRJ-SETU-GOV) Tj',
    'ET',

    // Footer
    '0.8 0.8 0.8 RG',
    '30 60 m 565 60 l S',

    'BT',
    '/F2 8 Tf',
    '0.5 0.5 0.5 rg',
    '30 45 Td',
    '(ProjectSetu - National Integrated Project Monitoring & Decision Support Platform | Government of India) Tj',
    '440 0 Td',
    '(Page 1 of 1) Tj',
    'ET',
  ];

  const streamContent = lines.join('\n');
  const streamLength = Buffer.byteLength(streamContent, 'utf8');

  const objects = [];
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = '<< /Type /Pages /Kids [3 0 R] /Count 1 >>';
  objects[3] =
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>';
  objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';
  objects[5] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objects[6] = `<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream`;

  let out = '%PDF-1.4\n';
  const offsets = [0];

  for (let i = 1; i <= 6; i++) {
    offsets[i] = Buffer.byteLength(out, 'utf8');
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(out, 'utf8');
  out += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    const offStr = String(offsets[i]).padStart(10, '0');
    out += `${offStr} 00000 n \n`;
  }

  out += `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(out, 'utf8');
}

function escapePdf(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

module.exports = { createPdf };
