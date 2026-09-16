import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ProjectSetu database seeding...');

  // 1. Seed or Upsert Departments
  const departmentsData = [
    {
      code: 'MoR',
      name: 'Ministry of Railways',
      departmentHead: 'Shri Satish Kumar, Chairman & CEO, Railway Board',
      contactInformation: 'crb@rb.railnet.gov.in | +91-11-23384010 | Rail Bhawan, Raisina Road, New Delhi',
    },
    {
      code: 'MoHUA',
      name: 'Ministry of Housing and Urban Affairs',
      departmentHead: 'Shri Manoj Joshi, Secretary',
      contactInformation: 'secy-mohua@nic.in | +91-11-23062377 | Nirman Bhawan, New Delhi',
    },
    {
      code: 'MoRTH',
      name: 'Ministry of Road Transport and Highways',
      departmentHead: 'Shri Anurag Jain, Secretary',
      contactInformation: 'sec-transport@nic.in | +91-11-23714938 | Transport Bhawan, 1 Parliament Street, New Delhi',
    },
    {
      code: 'MoJS',
      name: 'Ministry of Jal Shakti',
      departmentHead: 'Ms. Debashree Mukherjee, Secretary',
      contactInformation: 'sec-mowr@nic.in | +91-11-23710305 | Shram Shakti Bhawan, New Delhi',
    },
    {
      code: 'MeitY',
      name: 'Ministry of Electronics and Information Technology',
      departmentHead: 'Shri S. Krishnan, Secretary',
      contactInformation: 'secretary@meity.gov.in | +91-11-24364752 | Electronics Niketan, CGO Complex, New Delhi',
    },
    {
      code: 'MoHFW',
      name: 'Ministry of Health and Family Welfare',
      departmentHead: 'Shri Apurva Chandra, Secretary',
      contactInformation: 'secyhfw@nic.in | +91-11-23061863 | Nirman Bhawan, New Delhi',
    },
  ];

  const depts: Record<string, any> = {};
  for (const d of departmentsData) {
    depts[d.code] = await prisma.department.upsert({
      where: { code: d.code },
      update: {
        name: d.name,
        departmentHead: d.departmentHead,
        contactInformation: d.contactInformation,
      },
      create: d,
    });
  }
  console.log('✅ Synchronized 6 Government Departments.');

  // 2. Seed or Upsert Key Users
  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);

  const usersData = [
    {
      email: 'admin@projectsetu.gov.in',
      name: 'Dr. Arvind Subramanian (National Coordinator)',
      role: 'SUPER_ADMIN',
      departmentId: null,
    },
    {
      email: 'railways.admin@projectsetu.gov.in',
      name: 'Smt. Jaya Varma, Advisor (Infrastructure)',
      role: 'DEPARTMENT_ADMIN',
      departmentId: depts['MoR'].id,
    },
    {
      email: 'mohua.admin@projectsetu.gov.in',
      name: 'Vikramaditya Rao, Director (Metro Rail)',
      role: 'DEPARTMENT_ADMIN',
      departmentId: depts['MoHUA'].id,
    },
    {
      email: 'morth.admin@projectsetu.gov.in',
      name: 'Sunita Meena, JS (Highways)',
      role: 'DEPARTMENT_ADMIN',
      departmentId: depts['MoRTH'].id,
    },
    {
      email: 'pm.sharma@projectsetu.gov.in',
      name: 'Rajesh Sharma, Chief Project Manager (NHSRCL)',
      role: 'PROJECT_MANAGER',
      departmentId: depts['MoR'].id,
    },
    {
      email: 'pm.verma@projectsetu.gov.in',
      name: 'Priya Verma, General Manager (Metro Projects)',
      role: 'PROJECT_MANAGER',
      departmentId: depts['MoHUA'].id,
    },
    {
      email: 'pm.patel@projectsetu.gov.in',
      name: 'Amit Patel, Chief Project Manager (DFCCIL)',
      role: 'PROJECT_MANAGER',
      departmentId: depts['MoR'].id,
    },
    {
      email: 'citizen@projectsetu.gov.in',
      name: 'Ananya Deshmukh (Verified Citizen Reporter)',
      role: 'CITIZEN',
      departmentId: null,
    },
  ];

  const users: Record<string, any> = {};
  for (const u of usersData) {
    users[u.email] = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        role: u.role,
        departmentId: u.departmentId,
        isActive: true,
      },
      create: {
        email: u.email,
        name: u.name,
        password: defaultPasswordHash,
        role: u.role,
        departmentId: u.departmentId,
        isActive: true,
      },
    });
  }
  console.log('✅ Synchronized Key Administrative & Project Manager Users.');

  // 3. Define the 10 Real Government of India Infrastructure Projects
  const CRORE = 10000000;

  const realProjects = [
    {
      name: 'Mumbai–Ahmedabad High Speed Rail',
      projectCode: 'MAHSR-508',
      implementingAgency: 'National High Speed Rail Corporation Limited (NHSRCL)',
      state: 'Gujarat & Maharashtra',
      city: 'Mumbai, Thane, Surat, Vadodara, Ahmedabad',
      departmentId: depts['MoR'].id,
      projectManagerId: users['pm.sharma@projectsetu.gov.in'].id,
      location: 'Sabarmati Multi-Modal Transport Hub, Ahmedabad & BKC Mumbai',
      latitude: 23.0785,
      longitude: 72.5855,
      startDate: new Date('2017-09-14'),
      expectedCompletionDate: new Date('2027-12-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 48.5,
      allocatedBudget: 108000.0 * CRORE,
      utilizedBudget: 56420.0 * CRORE,
      revisedBudget: 110000.0 * CRORE,
      riskScore: 34.0,
      priority: 'CRITICAL',
      officialSourceUrl: 'https://www.nhsrcl.in',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'India’s first high-speed bullet train corridor spanning 508.17 km with 12 stations between Mumbai and Ahmedabad. Designed for 320 km/h operating speeds with JICA ODA loan assistance. Includes a 21 km undersea and underground tunnel between BKC and Shilphata.',
      milestones: [
        {
          name: 'Land Acquisition & Geotechnical Survey (Gujarat & Maharashtra)',
          description: '100% land acquired across Gujarat, DNH, and Maharashtra corridors.',
          expectedCompletionDate: new Date('2023-01-31'),
          actualCompletionDate: new Date('2023-01-15'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'Chief Project Manager (Land)',
          priority: 'HIGH',
        },
        {
          name: 'Viaduct Superstructure & Pier Construction (Surat-Bilimora)',
          description: 'Erection of full span girders over 300+ km of viaduct.',
          expectedCompletionDate: new Date('2025-06-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 78,
          responsiblePerson: 'Executive Director (Viaduct)',
          priority: 'CRITICAL',
        },
        {
          name: 'Undersea Tunnel Boring (BKC to Shilphata 21km)',
          description: 'Excavation of deep shafts and deployment of slurry TBMs for undersea tunneling.',
          expectedCompletionDate: new Date('2026-12-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 35,
          responsiblePerson: 'ED (Underground Works)',
          priority: 'CRITICAL',
        },
        {
          name: 'Surat–Bilimora 50km Trial Section Launch',
          description: 'First high-speed trial runs of Shinkansen E5 series trainsets on dedicated ballastless tracks.',
          expectedCompletionDate: new Date('2026-08-15'),
          status: 'IN_PROGRESS',
          progressPercentage: 40,
          responsiblePerson: 'Director (Rolling Stock)',
          priority: 'HIGH',
        },
        {
          name: 'Full Commercial Operation (Mumbai BKC to Sabarmati)',
          description: 'Full corridor commissioning with automated train control and safety certification.',
          expectedCompletionDate: new Date('2027-12-31'),
          status: 'NOT_STARTED',
          progressPercentage: 0,
          responsiblePerson: 'Managing Director (NHSRCL)',
          priority: 'CRITICAL',
        },
      ],
      risks: [
        {
          riskType: 'Geological & Tunneling Risk',
          severity: 'HIGH',
          description: 'Complex geological strata during 21km deep shaft and undersea tunnel boring near Thane Creek.',
          status: 'ACTIVE',
        },
        {
          riskType: 'Rolling Stock Delivery Schedule',
          severity: 'MEDIUM',
          description: 'Customization of Japanese Shinkansen E5 trainsets for Indian extreme temperature and dust conditions.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Chennai Metro Rail Phase II',
      projectCode: 'CMRL-PH2-116',
      implementingAgency: 'Chennai Metro Rail Limited (CMRL)',
      state: 'Tamil Nadu',
      city: 'Chennai',
      departmentId: depts['MoHUA'].id,
      projectManagerId: users['pm.verma@projectsetu.gov.in'].id,
      location: 'Madhavaram Milk Colony, SIPCOT & Lighthouse, Chennai',
      latitude: 13.1488,
      longitude: 80.2306,
      startDate: new Date('2019-11-20'),
      expectedCompletionDate: new Date('2028-12-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 42.0,
      allocatedBudget: 61843.0 * CRORE,
      utilizedBudget: 24850.0 * CRORE,
      revisedBudget: 63246.0 * CRORE,
      riskScore: 28.0,
      priority: 'HIGH',
      officialSourceUrl: 'https://chennaimetrorail.org',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'Mega expansion of Chennai Metro spanning 116.1 km with 119 stations across three key corridors: Corridor 3 (Madhavaram to SIPCOT), Corridor 4 (Lighthouse to Poonamallee Bypass), and Corridor 5 (Madhavaram to Sholinganallur). Approved as a central sector project.',
      milestones: [
        {
          name: 'Corridor 4 Poonamallee to Porur Elevated Viaduct',
          description: 'Civil structural completion of priority elevated stretch.',
          expectedCompletionDate: new Date('2025-11-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 82,
          responsiblePerson: 'Chief General Manager (Civil)',
          priority: 'HIGH',
        },
        {
          name: 'Twin Tunneling from Madhavaram to Kellys (Corridor 3)',
          description: 'Underground tunnel breakthroughs with Earth Pressure Balance TBMs.',
          expectedCompletionDate: new Date('2026-06-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 55,
          responsiblePerson: 'Director (Projects)',
          priority: 'CRITICAL',
        },
        {
          name: 'Driverless Trainsets (UTO) Delivery & Depot Integration',
          description: 'Supply of 3-car driverless trainsets from Sri City manufacturing facility.',
          expectedCompletionDate: new Date('2026-10-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 30,
          responsiblePerson: 'General Manager (Rolling Stock)',
          priority: 'MEDIUM',
        },
      ],
      risks: [
        {
          riskType: 'Underground Utilities & Water Table',
          severity: 'MEDIUM',
          description: 'High water table and legacy utilities in central Chennai underground alignment.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Western Dedicated Freight Corridor',
      projectCode: 'WDFC-1506',
      implementingAgency: 'Dedicated Freight Corridor Corporation of India Limited (DFCCIL)',
      state: 'UP, Haryana, Rajasthan, Gujarat, Maharashtra',
      city: 'Dadri, Rewari, Palanpur, Sanand, Vadodara, JNPT Mumbai',
      departmentId: depts['MoR'].id,
      projectManagerId: users['pm.patel@projectsetu.gov.in'].id,
      location: 'New Dadri (UP) to Jawaharlal Nehru Port Trust (JNPT, Navi Mumbai)',
      latitude: 28.5494,
      longitude: 77.5535,
      startDate: new Date('2006-10-05'),
      expectedCompletionDate: new Date('2025-12-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 93.5,
      allocatedBudget: 51101.0 * CRORE,
      utilizedBudget: 49820.0 * CRORE,
      revisedBudget: 56700.0 * CRORE,
      riskScore: 18.0,
      priority: 'CRITICAL',
      officialSourceUrl: 'https://dfccil.com',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'A 1,506 km electrified double-line freight rail corridor connecting Dadri in Uttar Pradesh to JNPT Port in Navi Mumbai. Engineered for heavy-haul double-stack container trains operating at 100 km/h, dramatically slashing transit time between northern hinterlands and western ports.',
      milestones: [
        {
          name: 'Rewari to Madar & Palanpur Section Commissioning',
          description: 'Operational double-stack container freight runs in Rajasthan & Gujarat.',
          expectedCompletionDate: new Date('2021-01-31'),
          actualCompletionDate: new Date('2021-01-07'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'Director (Operations)',
          priority: 'HIGH',
        },
        {
          name: 'Palanpur to Makarpura / Sanand Operationalization',
          description: 'Full freight connectivity through Gujarat industrial cluster.',
          expectedCompletionDate: new Date('2023-05-31'),
          actualCompletionDate: new Date('2023-05-15'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'CPM (Vadodara)',
          priority: 'HIGH',
        },
        {
          name: 'Vaitarna to JNPT Final Link Completion',
          description: 'Final 108 km electrified stretch connecting to maritime container berths.',
          expectedCompletionDate: new Date('2025-12-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 88,
          responsiblePerson: 'Director (Infrastructure)',
          priority: 'CRITICAL',
        },
      ],
      risks: [
        {
          riskType: 'Dense Suburban Corridor Interfacing',
          severity: 'LOW',
          description: 'Interfacing with busy Mumbai suburban lines near Vasai Road and Diva.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Rishikesh–Karnaprayag New Rail Line',
      projectCode: 'RK-NR-125',
      implementingAgency: 'Rail Vikas Nigam Limited (RVNL)',
      state: 'Uttarakhand',
      city: 'Rishikesh, Devprayag, Srinagar, Rudraprayag, Karnaprayag',
      departmentId: depts['MoR'].id,
      projectManagerId: users['pm.sharma@projectsetu.gov.in'].id,
      location: 'Yog Nagari Rishikesh to Karnaprayag Terminal, Garhwal Himalayas',
      latitude: 30.1086,
      longitude: 78.2916,
      startDate: new Date('2016-12-01'),
      expectedCompletionDate: new Date('2026-12-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 68.0,
      allocatedBudget: 16216.0 * CRORE,
      utilizedBudget: 17340.0 * CRORE,
      revisedBudget: 24659.0 * CRORE,
      riskScore: 45.0,
      priority: 'CRITICAL',
      officialSourceUrl: 'https://rvnl.org',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'A 125.2 km strategic railway project in the Garhwal Himalayas of Uttarakhand, featuring 104 km of tunneling (16 tunnels, including India’s longest 15.1 km tunnel between Devprayag and Janasu) and 12 stations, providing all-weather connectivity to Char Dham pilgrimage hubs and border defense areas.',
      milestones: [
        {
          name: 'Yog Nagari Rishikesh Station & Rail Overbridge',
          description: 'Modern terminal station with tourist facilitation center.',
          expectedCompletionDate: new Date('2020-03-31'),
          actualCompletionDate: new Date('2020-03-15'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'CPM (Rishikesh)',
          priority: 'HIGH',
        },
        {
          name: 'Main Tunnel & Escape Tunnel Excavation (Packages T1-T16)',
          description: 'Himalayan tunneling using New Austrian Tunneling Method (NATM).',
          expectedCompletionDate: new Date('2025-09-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 86,
          responsiblePerson: 'Chief Project Manager (Tunneling)',
          priority: 'CRITICAL',
        },
        {
          name: 'Major Alaknanda & Ganga River Bridges Construction',
          description: 'Constructing tall pier bridges across deep Himalayan river valleys.',
          expectedCompletionDate: new Date('2026-03-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 74,
          responsiblePerson: 'General Manager (Bridges)',
          priority: 'HIGH',
        },
      ],
      risks: [
        {
          riskType: 'Himalayan Seismic & Geological Squeezing',
          severity: 'CRITICAL',
          description: 'Unpredictable thrust zones, water ingress, and rock bursting in Main Central Thrust (MCT).',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Mumbai Urban Transport Project Phase IIIA',
      projectCode: 'MRVC-MUTP-3A',
      implementingAgency: 'Mumbai Railway Vikas Corporation (MRVC)',
      state: 'Maharashtra',
      city: 'Mumbai, Thane, Palghar, Raigad',
      departmentId: depts['MoR'].id,
      projectManagerId: users['pm.sharma@projectsetu.gov.in'].id,
      location: 'Mumbai Suburban Railway Network (Virar-Dahanu, Panvel-Karjat)',
      latitude: 19.0760,
      longitude: 72.8777,
      startDate: new Date('2019-03-07'),
      expectedCompletionDate: new Date('2027-03-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 38.5,
      allocatedBudget: 33690.0 * CRORE,
      utilizedBudget: 11450.0 * CRORE,
      revisedBudget: 33690.0 * CRORE,
      riskScore: 32.0,
      priority: 'HIGH',
      officialSourceUrl: 'https://mrvc.indianrailways.gov.in',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'Comprehensive modernization of Mumbai Suburban Railway Network approved by the Union Cabinet. Key works include quadrupling of Virar-Dahanu Road (64 km), new double line suburban corridor between Panvel and Karjat (28 km), elevated link between Kalwa and Airoli, procurement of 285 AC EMUs, and CBTC signaling.',
      milestones: [
        {
          name: 'Panvel–Karjat New Suburban Double Line Earthwork & Tunnels',
          description: 'Suburban connectivity cutting travel time between Navi Mumbai and Karjat.',
          expectedCompletionDate: new Date('2025-12-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 62,
          responsiblePerson: 'Chief Project Manager (Civil)',
          priority: 'HIGH',
        },
        {
          name: 'Virar–Dahanu Quadrupling Track & Bridge Works',
          description: 'Separating long-distance freight/mail trains from local suburban traffic.',
          expectedCompletionDate: new Date('2026-12-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 45,
          responsiblePerson: 'Executive Director (MRVC)',
          priority: 'HIGH',
        },
        {
          name: 'AC EMU Rake Procurement & Depot Infrastructure',
          description: 'Induction of state-of-the-art air-conditioned local trainsets.',
          expectedCompletionDate: new Date('2027-03-31'),
          status: 'NOT_STARTED',
          progressPercentage: 15,
          responsiblePerson: 'Director (Electrical)',
          priority: 'MEDIUM',
        },
      ],
      risks: [
        {
          riskType: 'Land Acquisition & Forest Clearances',
          severity: 'MEDIUM',
          description: 'Forest and private land acquisition along the Western Ghats section of Panvel-Karjat.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Bhopal Metro Rail Project',
      projectCode: 'MPMRCL-BPL-01',
      implementingAgency: 'Madhya Pradesh Metro Rail Corporation Limited (MPMRCL)',
      state: 'Madhya Pradesh',
      city: 'Bhopal',
      departmentId: depts['MoHUA'].id,
      projectManagerId: users['pm.verma@projectsetu.gov.in'].id,
      location: 'Subhash Nagar Metro Depot, AIIMS Corridor, Bhopal',
      latitude: 23.2330,
      longitude: 77.4350,
      startDate: new Date('2018-10-03'),
      expectedCompletionDate: new Date('2026-06-30'),
      status: 'IN_PROGRESS',
      progressPercentage: 58.0,
      allocatedBudget: 6941.4 * CRORE,
      utilizedBudget: 3920.0 * CRORE,
      revisedBudget: 7200.0 * CRORE,
      riskScore: 22.0,
      priority: 'HIGH',
      officialSourceUrl: 'https://mpmetrorail.com',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'Bhopal Metro (Bhoj Metro) comprises 2 corridors totaling 27.87 km: Orange Line (AIIMS to Karond Circle - 14.99 km) and Blue Line (Bhadbhada Square to Ratnagiri Tiraha - 12.88 km). Funded by Govt of India, Govt of MP, with multilateral financing from EIB.',
      milestones: [
        {
          name: 'Priority Section (AIIMS to Subhash Nagar) Viaduct Completion',
          description: '6.22 km priority stretch civil construction completed.',
          expectedCompletionDate: new Date('2023-09-30'),
          actualCompletionDate: new Date('2023-10-03'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'Director (Technical)',
          priority: 'HIGH',
        },
        {
          name: 'Subhash Nagar Depot & Signaling System Integration',
          description: 'CBTC automated signaling and train control commissioning.',
          expectedCompletionDate: new Date('2025-08-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 75,
          responsiblePerson: 'General Manager (Systems)',
          priority: 'HIGH',
        },
        {
          name: 'Subhash Nagar to Karond Underground & Elevated Extension',
          description: 'Civil and station structural works for remaining Orange Line.',
          expectedCompletionDate: new Date('2026-06-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 40,
          responsiblePerson: 'CPM (Bhopal)',
          priority: 'MEDIUM',
        },
      ],
      risks: [
        {
          riskType: 'Traffic Diversion in Old Bhopal Area',
          severity: 'LOW',
          description: 'Traffic management during underground tunneling near Bhopal Railway Station.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Indore Metro Rail Project',
      projectCode: 'MPMRCL-IND-01',
      implementingAgency: 'Madhya Pradesh Metro Rail Corporation Limited (MPMRCL)',
      state: 'Madhya Pradesh',
      city: 'Indore',
      departmentId: depts['MoHUA'].id,
      projectManagerId: users['pm.verma@projectsetu.gov.in'].id,
      location: 'Super Corridor & Gandhinagar Depot, Indore',
      latitude: 22.7533,
      longitude: 75.8937,
      startDate: new Date('2018-10-03'),
      expectedCompletionDate: new Date('2026-08-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 54.5,
      allocatedBudget: 7500.8 * CRORE,
      utilizedBudget: 3890.0 * CRORE,
      revisedBudget: 7850.0 * CRORE,
      riskScore: 25.0,
      priority: 'HIGH',
      officialSourceUrl: 'https://mpmetrorail.com',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'Indore Metro Rail Project features the Yellow Line, a 31.55 km ring line encompassing 29 stations connecting Palasia, Railway Station, Rajwada, Airport, Super Corridor, MR10, and Vijay Nagar. Funded by Asian Development Bank (ADB) and New Development Bank (NDB).',
      milestones: [
        {
          name: 'Super Corridor (Gandhi Nagar to MR10) Priority Trial Run',
          description: 'Successful trial run of Alstom Movia metro train on 5.9 km priority stretch.',
          expectedCompletionDate: new Date('2023-09-30'),
          actualCompletionDate: new Date('2023-09-30'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'Managing Director (MPMRCL)',
          priority: 'HIGH',
        },
        {
          name: 'Underground Section (Airport to Railway Station) TBM Boring',
          description: 'Excavation of underground stations at Rajwada and Bada Ganpati.',
          expectedCompletionDate: new Date('2026-03-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 35,
          responsiblePerson: 'Chief Engineer (Underground)',
          priority: 'CRITICAL',
        },
        {
          name: 'Full Ring Line Yellow Line Revenue Operation',
          description: 'Complete commercial service connecting Indore commercial & airport hubs.',
          expectedCompletionDate: new Date('2026-08-31'),
          status: 'NOT_STARTED',
          progressPercentage: 10,
          responsiblePerson: 'Director (Operations)',
          priority: 'HIGH',
        },
      ],
      risks: [
        {
          riskType: 'Heritage Zone Excavation at Rajwada',
          severity: 'MEDIUM',
          description: 'Careful micro-tunneling under dense historical markets of central Indore.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Patna Metro Rail Project',
      projectCode: 'PMRCL-PAT-01',
      implementingAgency: 'Patna Metro Rail Corporation Limited (PMRCL) / DMRC',
      state: 'Bihar',
      city: 'Patna',
      departmentId: depts['MoHUA'].id,
      projectManagerId: users['pm.verma@projectsetu.gov.in'].id,
      location: 'Patna Junction, Khemnichak & New ISBT Terminal, Patna',
      latitude: 25.5941,
      longitude: 85.1376,
      startDate: new Date('2019-02-17'),
      expectedCompletionDate: new Date('2027-03-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 36.0,
      allocatedBudget: 13365.77 * CRORE,
      utilizedBudget: 4620.0 * CRORE,
      revisedBudget: 13900.0 * CRORE,
      riskScore: 41.0,
      priority: 'HIGH',
      officialSourceUrl: 'https://patnametrorail.bihar.gov.in',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'Patna Metro spans 31.39 km with 24 stations across 2 corridors: Corridor 1 (Danapur to Khemnichak - 17.93 km) and Corridor 2 (Patna Junction to New ISBT - 14.56 km). Co-financed by Japan International Cooperation Agency (JICA) loan with execution support from Delhi Metro Rail Corporation (DMRC).',
      milestones: [
        {
          name: 'Priority Corridor (Malahi Pakri to New ISBT) Viaduct Launch',
          description: 'Elevated viaduct and station structural works for Corridor 2.',
          expectedCompletionDate: new Date('2025-10-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 72,
          responsiblePerson: 'Project Director (DMRC)',
          priority: 'HIGH',
        },
        {
          name: 'Patna Junction to Gandhi Maidan Underground TBM Mining',
          description: 'Twin tunnel boring under dense urban areas and Ashok Rajpath.',
          expectedCompletionDate: new Date('2026-06-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 28,
          responsiblePerson: 'Chief Engineer (Tunneling)',
          priority: 'CRITICAL',
        },
        {
          name: 'New ISBT Main Maintenance Depot Commissioning',
          description: 'Stabling lines, test tracks, and heavy overhaul workshops at Ranipur.',
          expectedCompletionDate: new Date('2025-12-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 65,
          responsiblePerson: 'General Manager (Depot)',
          priority: 'HIGH',
        },
      ],
      risks: [
        {
          riskType: 'Dense Ashok Rajpath Underground Utilities',
          severity: 'HIGH',
          description: 'Complex utility relocation along narrow historical hospital corridor near PMCH.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Kanpur Metro Rail Project',
      projectCode: 'UPMRC-KNP-01',
      implementingAgency: 'Uttar Pradesh Metro Rail Corporation (UPMRC)',
      state: 'Uttar Pradesh',
      city: 'Kanpur',
      departmentId: depts['MoHUA'].id,
      projectManagerId: users['pm.verma@projectsetu.gov.in'].id,
      location: 'IIT Kanpur, Motijheel, Kanpur Central & Naubasta',
      latitude: 26.5123,
      longitude: 80.2329,
      startDate: new Date('2019-11-15'),
      expectedCompletionDate: new Date('2026-03-31'),
      status: 'IN_PROGRESS',
      progressPercentage: 76.0,
      allocatedBudget: 11076.48 * CRORE,
      utilizedBudget: 8120.0 * CRORE,
      revisedBudget: 11076.48 * CRORE,
      riskScore: 16.0,
      priority: 'HIGH',
      officialSourceUrl: 'https://lmrcl.com/project/kanpur-metro',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'Kanpur Metro Rail Project spans 32.38 km across Corridor 1 (IIT Kanpur to Naubasta - 23.78 km) and Corridor 2 (CSA to Barra-8 - 8.6 km). The 9 km priority section (IIT Kanpur to Motijheel) was built in a record 24 months and is fully operational. Funded in part by European Investment Bank (EIB).',
      milestones: [
        {
          name: 'IIT Kanpur to Motijheel Priority Section Inauguaration',
          description: '9 km elevated section opened for public commercial service.',
          expectedCompletionDate: new Date('2021-12-31'),
          actualCompletionDate: new Date('2021-12-28'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'Managing Director (UPMRC)',
          priority: 'HIGH',
        },
        {
          name: 'Chunniganj to Nayaganj & Kanpur Central Underground Stretch',
          description: 'Twin tunnel breakthroughs and station fitments at Kanpur Central.',
          expectedCompletionDate: new Date('2025-06-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 88,
          responsiblePerson: 'Director (Infrastructure)',
          priority: 'HIGH',
        },
        {
          name: 'Transport Nagar to Naubasta Elevated Extension',
          description: 'Viaduct casting and pier capping on south Kanpur corridor.',
          expectedCompletionDate: new Date('2026-03-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 60,
          responsiblePerson: 'Chief Engineer (Elevated)',
          priority: 'MEDIUM',
        },
      ],
      risks: [
        {
          riskType: 'Kanpur Central Railway Track Under-crossing',
          severity: 'LOW',
          description: 'Tunneling beneath active Indian Railways mainline tracks at Kanpur Central.',
          status: 'ACTIVE',
        },
      ],
    },
    {
      name: 'Agra Metro Rail Project',
      projectCode: 'UPMRC-AGR-01',
      implementingAgency: 'Uttar Pradesh Metro Rail Corporation (UPMRC)',
      state: 'Uttar Pradesh',
      city: 'Agra',
      departmentId: depts['MoHUA'].id,
      projectManagerId: users['pm.verma@projectsetu.gov.in'].id,
      location: 'Taj East Gate, Agra Fort, Jama Masjid & Sikandra, Agra',
      latitude: 27.1600,
      longitude: 78.0500,
      startDate: new Date('2020-12-07'),
      expectedCompletionDate: new Date('2026-06-30'),
      status: 'IN_PROGRESS',
      progressPercentage: 64.0,
      allocatedBudget: 8379.62 * CRORE,
      utilizedBudget: 5180.0 * CRORE,
      revisedBudget: 8379.62 * CRORE,
      riskScore: 19.0,
      priority: 'HIGH',
      officialSourceUrl: 'https://lmrcl.com/project/agra-metro',
      dataClassification: 'OFFICIAL_SANCTIONED',
      description:
        'Agra Metro comprises 29.4 km across Corridor 1 (Taj East Gate to Sikandra - 14 km) and Corridor 2 (Agra Cantt to Kalindi Vihar - 15.4 km). The 6 km priority corridor connecting Taj East Gate to Jama Masjid / Mankameshwar Temple was inaugurated in March 2024. Funded with loan assistance from European Investment Bank (EIB).',
      milestones: [
        {
          name: 'Priority Corridor (Taj East Gate to Jama Masjid) Inauguaration',
          description: 'Commercial operations commenced on 6 km tourist priority stretch.',
          expectedCompletionDate: new Date('2024-03-31'),
          actualCompletionDate: new Date('2024-03-06'),
          status: 'COMPLETED',
          progressPercentage: 100,
          responsiblePerson: 'Managing Director (UPMRC)',
          priority: 'HIGH',
        },
        {
          name: 'Jama Masjid to RBS College Underground TBM Mining',
          description: 'Tunneling through old Agra urban area with heritage preservation safeguards.',
          expectedCompletionDate: new Date('2025-10-31'),
          status: 'IN_PROGRESS',
          progressPercentage: 68,
          responsiblePerson: 'Director (Projects)',
          priority: 'HIGH',
        },
        {
          name: 'Sikandra Terminal Station & Overhaul Depot',
          description: 'Civil and track laying works on western elevated terminus.',
          expectedCompletionDate: new Date('2026-06-30'),
          status: 'IN_PROGRESS',
          progressPercentage: 42,
          responsiblePerson: 'General Manager (Civil)',
          priority: 'MEDIUM',
        },
      ],
      risks: [
        {
          riskType: 'Archaeological Survey of India (ASI) Buffer Zone Compliance',
          severity: 'LOW',
          description: 'Vibration monitoring near Taj Mahal, Agra Fort, and historical monuments.',
          status: 'ACTIVE',
        },
      ],
    },
  ];

  // 4. Idempotently Seed/Upsert the 10 Real Projects
  for (const proj of realProjects) {
    const { milestones, risks, ...projectFields } = proj;

    // Check if project exists by name
    let existing = await prisma.project.findFirst({
      where: { name: projectFields.name },
    });

    let savedProject;
    if (existing) {
      savedProject = await prisma.project.update({
        where: { id: existing.id },
        data: projectFields,
      });
      console.log(`🔄 Updated project: ${savedProject.name}`);
    } else {
      savedProject = await prisma.project.create({
        data: projectFields,
      });
      console.log(`✨ Created project: ${savedProject.name}`);
    }

    // Upsert Milestones
    if (milestones && milestones.length > 0) {
      for (const m of milestones) {
        const existingMilestone = await prisma.milestone.findFirst({
          where: { projectId: savedProject.id, name: m.name },
        });

        if (!existingMilestone) {
          await prisma.milestone.create({
            data: {
              ...m,
              projectId: savedProject.id,
            },
          });
        }
      }
    }

    // Upsert Risks
    if (risks && risks.length > 0) {
      for (const r of risks) {
        const existingRisk = await prisma.risk.findFirst({
          where: { projectId: savedProject.id, riskType: r.riskType },
        });

        if (!existingRisk) {
          await prisma.risk.create({
            data: {
              ...r,
              projectId: savedProject.id,
            },
          });
        }
      }
    }

    // Seed realistic sample Budget Transaction if none exists
    const existingTx = await prisma.budgetTransaction.findFirst({
      where: { projectId: savedProject.id },
    });

    if (!existingTx) {
      await prisma.budgetTransaction.create({
        data: {
          projectId: savedProject.id,
          amount: Math.round(savedProject.utilizedBudget * 0.4),
          category: 'CAPITAL_EXPENDITURE',
          description: `Authorized milestone progress disbursement for civil construction & procurement.`,
        },
      });
    }

    // Seed sample Document (Approved DPR) if none exists
    const existingDoc = await prisma.document.findFirst({
      where: { projectId: savedProject.id },
    });

    if (!existingDoc) {
      const slugMap: Record<string, string> = {
        'Agra Metro Rail Project': 'agra-metro-dpr.pdf',
        'Kanpur Metro Rail Project': 'kanpur-metro-dpr.pdf',
        'Patna Metro Rail Project': 'patna-metro-dpr.pdf',
        'Indore Metro Rail Project': 'indore-metro-dpr.pdf',
        'Bhopal Metro Rail Project': 'bhopal-metro-dpr.pdf',
        'Mumbai Urban Transport Project Phase IIIA': 'mumbai-urban-transport-dpr.pdf',
        'Rishikesh–Karnaprayag New Rail Line': 'rishikesh-karnaprayag-dpr.pdf',
        'Western Dedicated Freight Corridor': 'western-dedicated-freight-corridor-dpr.pdf',
        'Chennai Metro Rail Phase II': 'chennai-metro-phase-ii-dpr.pdf',
        'Mumbai–Ahmedabad High Speed Rail': 'mumbai-ahmedabad-high-speed-rail-dpr.pdf',
      };
      const dprFilename = slugMap[savedProject.name] || 'official-dpr.pdf';

      await prisma.document.create({
        data: {
          projectId: savedProject.id,
          name: `${savedProject.name} - Detailed Project Report (Sanctioned DPR).pdf`,
          fileUrl: `/uploads/${dprFilename}`,
          fileType: 'application/pdf',
          category: 'DPR',
          isPublic: true,
          approvalStatus: 'APPROVED',
          uploadedById: savedProject.projectManagerId,
        },
      });
    }
  }

  // 5. Seed System Settings idempotently
  const defaultSettings = [
    { key: 'AI_ANOMALY_SENSITIVITY', value: '0.85', category: 'AI', description: 'Sensitivity threshold for detecting budget and delay anomalies' },
    { key: 'RISK_ESCALATION_THRESHOLD', value: '60', category: 'GENERAL', description: 'Score at which projects are escalated to Cabinet Secretary oversight' },
    { key: 'AUTO_ARCHIVE_COMPLETED_DAYS', value: '90', category: 'GENERAL', description: 'Days after completion when a project is archived' },
    { key: 'CITIZEN_GRIEVANCE_AUTO_ESCALATE_DAYS', value: '14', category: 'NOTIFICATIONS', description: 'Days before an unaddressed grievance escalates' },
  ];

  for (const s of defaultSettings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  console.log('✅ Synchronized Global System Configuration Settings.');
  console.log('🎉 Database seeding completed successfully with 10 official Government of India infrastructure projects!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
