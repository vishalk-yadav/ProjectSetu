const fs = require('fs');
const path = require('path');
const { createPdf } = require('./pdfGenerator');
const { PrismaClient } = require(path.resolve(__dirname, '../backend/node_modules/@prisma/client'));

const prisma = new PrismaClient();
const uploadsDir = path.resolve(__dirname, '../backend/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Project Details mapping for authentic DPR generation
const projectDprs = [
  {
    slug: 'agra-metro-dpr.pdf',
    projectName: 'Agra Metro Rail Project',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    executingAgency: 'Uttar Pradesh Metro Rail Corporation (UPMRC)',
    sanctionedCost: 'INR 8,379.62 Crore',
    lengthScope: '29.4 km (2 Corridors, 27 Stations)',
    sanctionDate: 'February 2019',
    targetDate: 'December 2026',
    status: 'IN_PROGRESS',
    description: 'Mass rapid transit system for the historic city of Agra connecting Taj East Gate to Sikandra.',
  },
  {
    slug: 'kanpur-metro-dpr.pdf',
    projectName: 'Kanpur Metro Rail Project',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    executingAgency: 'Uttar Pradesh Metro Rail Corporation (UPMRC)',
    sanctionedCost: 'INR 11,076.48 Crore',
    lengthScope: '32.385 km (2 Corridors, 30 Stations)',
    sanctionDate: 'February 2019',
    targetDate: 'November 2026',
    status: 'IN_PROGRESS',
    description: 'Urban mobility transformation for Kanpur industrial hub connecting IIT Kanpur to Naubasta.',
  },
  {
    slug: 'patna-metro-dpr.pdf',
    projectName: 'Patna Metro Rail Project',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    executingAgency: 'Delhi Metro Rail Corporation / PMRC',
    sanctionedCost: 'INR 13,365.77 Crore',
    lengthScope: '31.39 km (2 Corridors, 24 Stations)',
    sanctionDate: 'February 2019',
    targetDate: 'December 2027',
    status: 'IN_PROGRESS',
    description: 'Comprehensive mass transit network serving Greater Patna from Danapur to Khemnichak.',
  },
  {
    slug: 'indore-metro-dpr.pdf',
    projectName: 'Indore Metro Rail Project',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    executingAgency: 'Madhya Pradesh Metro Rail Corporation (MPMRCL)',
    sanctionedCost: 'INR 7,500.80 Crore',
    lengthScope: '31.55 km (Yellow Ring Line, 29 Stations)',
    sanctionDate: 'October 2018',
    targetDate: 'March 2027',
    status: 'IN_PROGRESS',
    description: 'High-capacity metro ring connecting Devi Ahilyabai Holkar Airport to Palasia and Bhanwar Kuan.',
  },
  {
    slug: 'bhopal-metro-dpr.pdf',
    projectName: 'Bhopal Metro Rail Project',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    executingAgency: 'Madhya Pradesh Metro Rail Corporation (MPMRCL)',
    sanctionedCost: 'INR 6,941.40 Crore',
    lengthScope: '27.87 km (Orange & Blue Corridors, 28 Stations)',
    sanctionDate: 'October 2018',
    targetDate: 'June 2027',
    status: 'IN_PROGRESS',
    description: 'Modern transit network linking Karond Circle, AIIMS Bhopal, and Bhadbhada Square.',
  },
  {
    slug: 'mumbai-urban-transport-dpr.pdf',
    projectName: 'Mumbai Urban Transport Project Phase IIIA',
    ministry: 'Ministry of Railways (MoR)',
    executingAgency: 'Mumbai Railway Vikas Corporation (MRVC)',
    sanctionedCost: 'INR 33,690.00 Crore',
    lengthScope: 'Quadrupling Virar-Dahanu & Suburban Expansion',
    sanctionDate: 'March 2019',
    targetDate: 'December 2028',
    status: 'IN_PROGRESS',
    description: 'Major suburban rail infrastructure capacity expansion for Mumbai Metropolitan Region.',
  },
  {
    slug: 'rishikesh-karnaprayag-dpr.pdf',
    projectName: 'Rishikesh–Karnaprayag New Rail Line',
    ministry: 'Ministry of Railways (MoR)',
    executingAgency: 'Rail Vikas Nigam Limited (RVNL)',
    sanctionedCost: 'INR 16,216.00 Crore',
    lengthScope: '125.2 km (12 Stations, 17 Tunnels spanning 105 km)',
    sanctionDate: 'September 2016',
    targetDate: 'December 2026',
    status: 'IN_PROGRESS',
    description: 'Strategic Himalayan railway corridor facilitating Char Dham connectivity across Uttarakhand.',
  },
  {
    slug: 'western-dedicated-freight-corridor-dpr.pdf',
    projectName: 'Western Dedicated Freight Corridor',
    ministry: 'Ministry of Railways (MoR)',
    executingAgency: 'Dedicated Freight Corridor Corporation of India (DFCCIL)',
    sanctionedCost: 'INR 51,101.00 Crore',
    lengthScope: '1,506 km (Dadri, UP to JNPT Mumbai)',
    sanctionDate: 'February 2008',
    targetDate: 'December 2026',
    status: 'IN_PROGRESS',
    description: 'High-speed, heavy-haul electrified double-line freight artery linking Northern India to JNPT port.',
  },
  {
    slug: 'chennai-metro-phase-ii-dpr.pdf',
    projectName: 'Chennai Metro Rail Phase II',
    ministry: 'Ministry of Housing and Urban Affairs (MoHUA)',
    executingAgency: 'Chennai Metro Rail Limited (CMRL)',
    sanctionedCost: 'INR 63,246.00 Crore',
    lengthScope: '118.9 km (3 Corridors, 128 Stations)',
    sanctionDate: 'August 2021',
    targetDate: 'December 2028',
    status: 'IN_PROGRESS',
    description: 'Massive transit expansion connecting Madhavaram to SIPCOT, Lighthouse to Poonamallee.',
  },
  {
    slug: 'mumbai-ahmedabad-high-speed-rail-dpr.pdf',
    projectName: 'Mumbai–Ahmedabad High Speed Rail',
    ministry: 'Ministry of Railways (MoR)',
    executingAgency: 'National High Speed Rail Corporation (NHSRCL)',
    sanctionedCost: 'INR 1,08,000.00 Crore',
    lengthScope: '508.17 km (12 Stations, Subsea Tunnel in Thane Creek)',
    sanctionDate: 'December 2015',
    targetDate: 'August 2027',
    status: 'IN_PROGRESS',
    description: 'First high-speed bullet train corridor of India operating Shinkansen E5 Series technology.',
  },
];

// Master Official DPR fallback
const masterDpr = {
  slug: 'official-dpr.pdf',
  projectName: 'ProjectSetu Master Detailed Project Report',
  ministry: 'Cabinet Secretariat / Ministry of Statistics & Programme Implementation',
  executingAgency: 'ProjectSetu National Surveillance Directorate',
  sanctionedCost: 'INR 3,25,000.00 Crore (Combined Oversight)',
  lengthScope: 'National Integrated Multi-Sector Infrastructure Portfolio',
  sanctionDate: 'January 2026',
  targetDate: 'December 2030',
  status: 'APPROVED',
  description: 'Master benchmark detailed project report containing unified statutory and governance benchmarks.',
};

async function main() {
  console.log('--- Generating Official DPR PDF Files ---');

  // 1. Generate master official-dpr.pdf
  const masterBuffer = createPdf(masterDpr);
  const masterPath = path.join(uploadsDir, masterDpr.slug);
  fs.writeFileSync(masterPath, masterBuffer);
  console.log(`✅ Generated: ${masterPath} (${masterBuffer.length} bytes)`);

  // 2. Generate each project-specific DPR PDF
  for (const dpr of projectDprs) {
    const buffer = createPdf(dpr);
    const filePath = path.join(uploadsDir, dpr.slug);
    fs.writeFileSync(filePath, buffer);
    console.log(`✅ Generated: ${filePath} (${buffer.length} bytes)`);
  }

  // 3. Update database records to match project-specific DPR URLs
  console.log('\n--- Synchronizing Database Document Records ---');
  const documents = await prisma.document.findMany({
    include: { project: true },
  });

  for (const doc of documents) {
    if (!doc.project) continue;
    const match = projectDprs.find(
      (p) =>
        doc.project.name.toLowerCase().includes(p.projectName.toLowerCase()) ||
        p.projectName.toLowerCase().includes(doc.project.name.toLowerCase())
    );

    if (match) {
      const newUrl = `/uploads/${match.slug}`;
      await prisma.document.update({
        where: { id: doc.id },
        data: { fileUrl: newUrl },
      });
      console.log(`✅ Updated "${doc.name}" -> ${newUrl}`);
    } else if (doc.fileUrl === '/uploads/official-dpr.pdf') {
      console.log(`ℹ️ Retained default official DPR for "${doc.name}"`);
    }
  }

  console.log('\n🎉 All PDF documents generated and database URLs synchronized successfully!');
}

main().finally(() => prisma.$disconnect());
