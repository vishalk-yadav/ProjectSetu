# ProjectSetu

> **"Connecting Departments. Connecting Projects. Enabling Smarter Governance."**

**ProjectSetu** is a centralized, Web-Based Integrated Project Monitoring & Decision Support Platform. It bridges inter-departmental silos by integrating real-time telemetry, automated milestone tracking, budget burn surveillance, multi-factor risk scoring, AI-driven delay & cost overrun predictions, autonomous anomaly detection, and natural language query assistance.

---

## 🏛️ Project Vision

Government mega-projects are frequently managed across disjointed departments, spreadsheets, legacy systems, and isolated communication channels. This fragmentation breeds delayed clearances, cost overruns, invisible milestone bottlenecks, and reactive firefighting.

**ProjectSetu** solves this by establishing a single, unified digital command center:
- **Centralized Multi-Project Surveillance**: Comprehensive tracking across all Union Ministries.
- **ProjectSetu Risk Intelligence Engine**: Composite 0–100 risk scoring with transparent, explainable rationales.
- **AI-Based Delay Prediction**: Statistical schedule forecasting with delay probabilities and corrective recommendations.
- **Cost Overrun Predictor**: Earned Value Management (EVM) evaluating Cost Performance Index (CPI) and Estimate At Completion (EAC).
- **Autonomous Anomaly Detection**: Proactive alerts for spend surges, project staleness, and milestone divergence.
- **AI Executive Summaries**: Context-aware, human-readable briefs for executive secretaries and ministers.
- **Interactive Project Map**: All-India Leaflet GIS mapping with live risk color coding.
- **ProjectSetu AI Assistant**: Natural language conversational assistant for immediate data exploration.

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS (Government Command Center Palette)
- **Visualizations**: Recharts (Donut, Multi-Bar, Radial, Progress telemetry)
- **Mapping**: Leaflet & React-Leaflet GIS
- **Icons**: Lucide React
- **Routing & Networking**: React Router DOM v7 & Axios

### Backend
- **Runtime**: Node.js & Express.js with TypeScript
- **Architecture**: Clean layered architecture (`Routes → Controllers → Services → Database`)
- **ORM & Database**: Prisma ORM with SQLite (zero-config local run) and instant switch to PostgreSQL
- **Security & Auth**: JWT (JSON Web Tokens), bcryptjs, Helmet, CORS
- **File Uploads**: Multer local storage (S3-ready interface)

---

## 🔑 Demo Credentials (Role-Based Access Control)

ProjectSetu features a **1-Click Demo Login** on the login screen for instantaneous testing:

| Role | Name | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | Dr. Arvind Subramanian | `admin@projectsetu.gov.in` | `Admin@123` | Full access across all ministries, users, analytics, and system settings |
| **Department Admin** | Sunita Meena (MoRTH) | `morth.admin@projectsetu.gov.in` | `Admin@123` | Department management, projects, users & performance analytics |
| **Project Manager** | Rajesh Sharma | `pm.sharma@projectsetu.gov.in` | `Admin@123` | Project CRUD, milestone logging, risks, progress updates & documents |
| **Authority / Viewer** | Harish Chandra (Vigilance) | `viewer@projectsetu.gov.in` | `Admin@123` | Read-only access to dashboards, reports, maps, and analytics |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run seed      # Seeds 5 Departments, 10 Users, 20 Projects, Milestones & Anomalies
npm run dev       # Starts backend API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev       # Starts frontend on http://localhost:5173
```

Visit **http://localhost:5173** in your browser and click any of the **1-Click Evaluator Login** buttons to immediately enter the Command Center!

---

## 🔄 Switching to PostgreSQL

By default, ProjectSetu runs on a portable SQLite database (`dev.db`) for zero-setup local evaluation. To switch to PostgreSQL:

1. Update `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `backend/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/projectsetu?schema=public"
   ```
3. Run migrations and re-seed:
   ```bash
   npx prisma db push
   npm run seed
   ```

---

## 🧠 Core SIH Innovation Highlights

1. **ProjectSetu Risk Intelligence Engine (`src/ai/riskEngine.ts`)**:
   Multi-factor composite scoring combining Schedule Delay Risk, Budget Burn Ratio, Milestone Bottlenecks, Progress Variance, and Active Anomalies into an explainable 0–100 score.

2. **AI Delay Predictor (`src/ai/delayPrediction.ts`)**:
   Calculates progress velocity (%/day) vs planned rate, forecast completion date, delay probability percentage, and recommended corrective actions.

3. **Cost Overrun Predictor (`src/ai/costPrediction.ts`)**:
   Utilizes standard Earned Value Management (EVM) formulas: CPI ($EV / AC$), SPI ($EV / PV$), and Estimate At Completion ($EAC = BAC / CPI$) to predict final expenditure.

4. **Anomaly Detection Engine (`src/ai/anomalyDetection.ts`)**:
   Scans for telemetry staleness (>30 days inactive), spend surges (>20% in 30 days), repeated deadline slips, and severe fiscal-physical divergence.

5. **ProjectSetu Smart Summary (`src/ai/projectSummary.ts`)**:
   Generates an executive-ready multi-paragraph narrative synthesizing progress, schedule, budget, risks, and next steps.

6. **ProjectSetu AI Assistant (`src/ai/naturalLanguageQuery.ts`)**:
   Natural language conversational interface enabling queries like *"Show projects delayed by more than 30 days"* or *"Which department has the highest number of high-risk projects?"*.
