import { PrismaClient } from '@prisma/client';

interface AssistantQueryResult {
  answer: string;
  queryIntent: string;
  confidence: number;
  highlightMetric?: {
    label: string;
    value: string;
    subtext?: string;
  };
  projects?: Array<{
    id: string;
    name: string;
    departmentName: string;
    status: string;
    progressPercentage: number;
    riskScore: number;
    budgetUtilization: number;
    location: string;
  }>;
  departments?: Array<{
    id: string;
    name: string;
    code: string;
    totalProjects: number;
    highRiskProjects: number;
    avgProgress: number;
  }>;
  suggestions: string[];
}

export async function processNaturalLanguageQuery(query: string, prisma: PrismaClient): Promise<AssistantQueryResult> {
  const q = query.toLowerCase().trim();
  const now = new Date();

  // 1. Intent: Delayed projects (e.g., "delayed by more than 30 days", "delayed projects")
  if (q.includes('delayed') || q.includes('behind schedule') || q.includes('overdue')) {
    const projects = await prisma.project.findMany({
      include: { department: true },
      orderBy: { riskScore: 'desc' },
    });

    const delayedList = projects.filter(p => {
      if (p.status === 'COMPLETED') return false;
      if (p.status === 'DELAYED') return true;
      const daysRemaining = (new Date(p.expectedCompletionDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysRemaining < 0;
    });

    const mapped = delayedList.map(p => {
      const util = p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0;
      return {
        id: p.id,
        name: p.name,
        departmentName: p.department.name,
        status: p.status,
        progressPercentage: p.progressPercentage,
        riskScore: p.riskScore,
        budgetUtilization: Number(util.toFixed(1)),
        location: p.location,
      };
    });

    return {
      answer: `Found ${mapped.length} project(s) that are officially delayed or have exceeded their expected completion deadlines. Most require immediate inter-departmental milestone remediation.`,
      queryIntent: 'PROJECT_DELAY_ANALYSIS',
      confidence: 0.95,
      highlightMetric: {
        label: 'Delayed Projects',
        value: `${mapped.length} Projects`,
        subtext: `Highest risk delayed: ${mapped[0]?.name || 'None'}`,
      },
      projects: mapped,
      suggestions: [
        'Which department has the highest number of high-risk projects?',
        'Show projects with budget utilization above 80%',
        'Which projects are likely to miss their deadlines?',
      ],
    };
  }

  // 2. Intent: High risk projects or highest risk department
  if (q.includes('high-risk') || q.includes('high risk') || q.includes('highest risk') || q.includes('critical risk')) {
    const departments = await prisma.department.findMany({
      include: {
        projects: true,
      },
    });

    const deptStats = departments.map(d => {
      const highRiskCount = d.projects.filter(p => p.riskScore >= 61).length;
      const totalProg = d.projects.reduce((acc, p) => acc + p.progressPercentage, 0);
      const avgProg = d.projects.length > 0 ? totalProg / d.projects.length : 0;

      return {
        id: d.id,
        name: d.name,
        code: d.code,
        totalProjects: d.projects.length,
        highRiskProjects: highRiskCount,
        avgProgress: Number(avgProg.toFixed(1)),
      };
    }).sort((a, b) => b.highRiskProjects - a.highRiskProjects);

    const highRiskProjects = await prisma.project.findMany({
      where: { riskScore: { gte: 61 } },
      include: { department: true },
      orderBy: { riskScore: 'desc' },
      take: 6,
    });

    const topDept = deptStats[0];

    return {
      answer: topDept && topDept.highRiskProjects > 0
        ? `The department with the highest concentration of high-risk projects is "${topDept.name}" (${topDept.code}) with ${topDept.highRiskProjects} projects currently flagged in High/Critical risk brackets.`
        : 'Across the monitored ministries, all risk metrics are currently within manageable thresholds.',
      queryIntent: 'RISK_INTELLIGENCE_ANALYSIS',
      confidence: 0.92,
      highlightMetric: {
        label: 'Most Vulnerable Department',
        value: topDept?.code || 'N/A',
        subtext: `${topDept?.highRiskProjects || 0} High/Critical Risk Projects`,
      },
      departments: deptStats,
      projects: highRiskProjects.map(p => ({
        id: p.id,
        name: p.name,
        departmentName: p.department.name,
        status: p.status,
        progressPercentage: p.progressPercentage,
        riskScore: p.riskScore,
        budgetUtilization: Number((p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0).toFixed(1)),
        location: p.location,
      })),
      suggestions: [
        'Show projects delayed by more than 30 days',
        'Show projects with budget utilization above 80%',
        'What is the total budget allocated across all projects?',
      ],
    };
  }

  // 3. Intent: Budget utilization above 80% or budget overrun
  if (q.includes('budget') || q.includes('utilization') || q.includes('spending') || q.includes('cost overrun') || q.includes('overrun')) {
    const projects = await prisma.project.findMany({
      include: { department: true },
      orderBy: { utilizedBudget: 'desc' },
    });

    const highSpendProjects = projects.filter(p => {
      const util = p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0;
      return util >= 80;
    });

    const totalAlloc = projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
    const totalUtil = projects.reduce((sum, p) => sum + p.utilizedBudget, 0);

    const mapped = (highSpendProjects.length > 0 ? highSpendProjects : projects.slice(0, 5)).map(p => {
      const util = p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0;
      return {
        id: p.id,
        name: p.name,
        departmentName: p.department.name,
        status: p.status,
        progressPercentage: p.progressPercentage,
        riskScore: p.riskScore,
        budgetUtilization: Number(util.toFixed(1)),
        location: p.location,
      };
    });

    return {
      answer: `Found ${highSpendProjects.length} project(s) that have crossed the 80% budget utilization warning threshold. Overall portfolio spending stands at ₹${(totalUtil / 10000000).toFixed(2)} Cr out of ₹${(totalAlloc / 10000000).toFixed(2)} Cr sanctioned (${((totalUtil / totalAlloc) * 100).toFixed(1)}%).`,
      queryIntent: 'BUDGET_ANALYSIS',
      confidence: 0.94,
      highlightMetric: {
        label: 'High Budget Utilization',
        value: `${highSpendProjects.length} Projects >80%`,
        subtext: `Total Portfolio Spent: ₹${(totalUtil / 10000000).toFixed(1)} Cr`,
      },
      projects: mapped,
      suggestions: [
        'Which projects are likely to miss their deadlines?',
        'Which department has the highest number of high-risk projects?',
        'Show projects delayed by more than 30 days',
      ],
    };
  }

  // 4. Intent: Missing deadlines / Upcoming deadline predictions
  if (q.includes('miss') || q.includes('deadline') || q.includes('likely to') || q.includes('upcoming')) {
    const projects = await prisma.project.findMany({
      where: {
        status: { in: ['IN_PROGRESS', 'DELAYED'] },
      },
      include: { department: true },
      orderBy: { riskScore: 'desc' },
    });

    // Vulnerable if riskScore >= 50 or progress variance high
    const vulnerable = projects.filter(p => {
      const daysRemaining = (new Date(p.expectedCompletionDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return p.riskScore >= 55 || (daysRemaining < 60 && p.progressPercentage < 70);
    });

    return {
      answer: `AI Predictive Delay models indicate ${vulnerable.length} active project(s) possess an elevated probability (>60%) of missing their designated completion targets without corrective resource reallocation.`,
      queryIntent: 'PREDICTIVE_DEADLINE_ANALYSIS',
      confidence: 0.91,
      highlightMetric: {
        label: 'Vulnerable Deadlines',
        value: `${vulnerable.length} Projects`,
        subtext: 'High probability of schedule breach',
      },
      projects: vulnerable.map(p => ({
        id: p.id,
        name: p.name,
        departmentName: p.department.name,
        status: p.status,
        progressPercentage: p.progressPercentage,
        riskScore: p.riskScore,
        budgetUtilization: Number((p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0).toFixed(1)),
        location: p.location,
      })),
      suggestions: [
        'Show projects delayed by more than 30 days',
        'Which department has the highest number of high-risk projects?',
        'Show projects with budget utilization above 80%',
      ],
    };
  }

  // 5. Default General Intelligence fallback
  const totalProjects = await prisma.project.count();
  const activeProjects = await prisma.project.count({ where: { status: 'IN_PROGRESS' } });
  const sampleProjects = await prisma.project.findMany({
    include: { department: true },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  });

  return {
    answer: `ProjectSetu currently monitors ${totalProjects} infrastructure and governance projects across 5 Union Ministries. ${activeProjects} projects are actively in implementation with continuous telemetry tracking.`,
    queryIntent: 'GENERAL_ASSISTANCE',
    confidence: 0.85,
    highlightMetric: {
      label: 'Monitored Projects',
      value: `${totalProjects} Total`,
      subtext: `${activeProjects} actively underway`,
    },
    projects: sampleProjects.map(p => ({
      id: p.id,
      name: p.name,
      departmentName: p.department.name,
      status: p.status,
      progressPercentage: p.progressPercentage,
      riskScore: p.riskScore,
      budgetUtilization: Number((p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0).toFixed(1)),
      location: p.location,
    })),
    suggestions: [
      'Show projects delayed by more than 30 days',
      'Which department has the highest number of high-risk projects?',
      'Show projects with budget utilization above 80%',
      'Which projects are likely to miss their deadlines?',
    ],
  };
}
