import { prisma } from '../utils/prisma';
import { calculateProjectRisk } from '../ai/riskEngine';
import { detectProjectAnomalies } from '../ai/anomalyDetection';

export class RiskService {
  static async getProjectRisk(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: true,
        risks: true,
        anomalies: true,
      },
    });

    if (!project) throw new Error('Project not found');

    const analysis = calculateProjectRisk(project);

    // If persisted riskScore is out of sync by > 2 points, update DB
    if (Math.abs(project.riskScore - analysis.score) >= 2) {
      await prisma.project.update({
        where: { id: projectId },
        data: { riskScore: analysis.score },
      });
    }

    return {
      projectId: project.id,
      projectName: project.name,
      ...analysis,
    };
  }

  static async analyzeAndPersistProject(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: true,
        risks: true,
        anomalies: true,
        budgetTransactions: true,
      },
    });

    if (!project) throw new Error('Project not found');

    // 1. Calculate risk
    const analysis = calculateProjectRisk(project);
    await prisma.project.update({
      where: { id: projectId },
      data: { riskScore: analysis.score },
    });

    // 2. Detect anomalies
    const detected = detectProjectAnomalies(project);

    // Check existing anomalies to prevent duplicate logs on same day
    for (const an of detected) {
      const exists = await prisma.anomaly.findFirst({
        where: {
          projectId,
          type: an.type,
        },
      });

      if (!exists) {
        await prisma.anomaly.create({
          data: {
            projectId,
            type: an.type,
            severity: an.severity,
            description: an.description,
          },
        });

        // Trigger smart notification if critical/high
        if (an.severity === 'CRITICAL' || an.severity === 'HIGH') {
          await prisma.notification.create({
            data: {
              title: `Anomaly Detected: ${project.name}`,
              message: an.description,
              type: an.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
              severity: an.severity,
            },
          });
        }
      }
    }

    return {
      riskAnalysis: analysis,
      detectedAnomalies: detected,
    };
  }

  static async getPortfolioRiskOverview() {
    const projects = await prisma.project.findMany({
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        _count: {
          select: {
            risks: true,
            anomalies: true,
          },
        },
      },
      orderBy: { riskScore: 'desc' },
    });

    const highRiskProjects = projects.filter(p => p.riskScore >= 61);
    const moderateRiskProjects = projects.filter(p => p.riskScore > 30 && p.riskScore < 61);
    const lowRiskProjects = projects.filter(p => p.riskScore <= 30);

    const activeAnomalies = await prisma.anomaly.findMany({
      include: {
        project: {
          select: { id: true, name: true, department: { select: { code: true } } },
        },
      },
      orderBy: { detectedAt: 'desc' },
      take: 20,
    });

    const activeRisks = await prisma.risk.findMany({
      include: {
        project: {
          select: { id: true, name: true, department: { select: { code: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      summary: {
        totalProjects: projects.length,
        criticalCount: projects.filter(p => p.riskScore >= 81).length,
        highRiskCount: highRiskProjects.length,
        moderateRiskCount: moderateRiskProjects.length,
        lowRiskCount: lowRiskProjects.length,
        activeAnomaliesCount: activeAnomalies.length,
        activeRisksCount: activeRisks.length,
      },
      highRiskProjects,
      activeAnomalies,
      activeRisks,
    };
  }

  static async addRisk(data: {
    projectId: string;
    riskType: string;
    severity: string;
    description: string;
    status?: string;
  }) {
    const risk = await prisma.risk.create({
      data: {
        projectId: data.projectId,
        riskType: data.riskType,
        severity: data.severity || 'MEDIUM',
        description: data.description,
        status: data.status || 'ACTIVE',
      },
    });

    // Recalculate project risk
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { milestones: true, risks: true, anomalies: true },
    });

    if (project) {
      const res = calculateProjectRisk(project);
      await prisma.project.update({
        where: { id: data.projectId },
        data: { riskScore: res.score },
      });
    }

    return risk;
  }

  static async updateRiskStatus(id: string, status: string) {
    const risk = await prisma.risk.update({
      where: { id },
      data: { status },
    });

    const project = await prisma.project.findUnique({
      where: { id: risk.projectId },
      include: { milestones: true, risks: true, anomalies: true },
    });

    if (project) {
      const res = calculateProjectRisk(project);
      await prisma.project.update({
        where: { id: risk.projectId },
        data: { riskScore: res.score },
      });
    }

    return risk;
  }

  static async raiseAlert(
    currentUser: any,
    data: {
      projectId: string;
      riskType: string;
      severity: string;
      description: string;
      recommendation?: string;
    }
  ) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { department: true },
    });

    if (!project) throw new Error('Project not found');

    const risk = await prisma.risk.create({
      data: {
        projectId: data.projectId,
        riskType: data.riskType,
        severity: data.severity || 'HIGH',
        description: data.description,
        status: 'ACTIVE',
      },
    });

    // Create a high-priority system notification
    await prisma.notification.create({
      data: {
        title: `🚨 Escalated Alert: ${project.name}`,
        message: `${currentUser?.name || 'Project Team'} raised a ${data.severity} risk [${data.riskType}]: "${data.description}"`,
        type: data.severity === 'CRITICAL' || data.severity === 'HIGH' ? 'ALERT' : 'WARNING',
        severity: data.severity || 'HIGH',
      },
    });

    // Recalculate project risk
    const updatedProject = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: { milestones: true, risks: true, anomalies: true },
    });

    if (updatedProject) {
      const res = calculateProjectRisk(updatedProject);
      await prisma.project.update({
        where: { id: data.projectId },
        data: { riskScore: res.score },
      });
    }

    return risk;
  }
}

