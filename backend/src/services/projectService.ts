import { prisma } from '../utils/prisma';
import { calculateProjectRisk } from '../ai/riskEngine';
import { detectProjectAnomalies } from '../ai/anomalyDetection';

export interface ProjectFilterOptions {
  departmentId?: string;
  status?: string;
  riskLevel?: string; // LOW, MODERATE, HIGH, CRITICAL
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ProjectService {
  static async listProjects(options: ProjectFilterOptions = {}) {
    const {
      departmentId,
      status,
      riskLevel,
      priority,
      search,
      page = 1,
      limit = 50,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = options;

    const where: any = {};

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (riskLevel) {
      if (riskLevel === 'LOW') where.riskScore = { lte: 30 };
      else if (riskLevel === 'MODERATE') where.riskScore = { gt: 30, lte: 60 };
      else if (riskLevel === 'HIGH') where.riskScore = { gt: 60, lte: 80 };
      else if (riskLevel === 'CRITICAL') where.riskScore = { gt: 80 };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, projects] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        include: {
          department: {
            select: { id: true, name: true, code: true },
          },
          projectManager: {
            select: { id: true, name: true, email: true },
          },
          milestones: {
            select: { id: true, name: true, status: true, progressPercentage: true, expectedCompletionDate: true },
          },
          _count: {
            select: {
              milestones: true,
              risks: true,
              anomalies: true,
              documents: true,
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return {
      projects,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getProjectById(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        department: true,
        projectManager: {
          select: { id: true, name: true, email: true, role: true },
        },
        milestones: {
          orderBy: { expectedCompletionDate: 'asc' },
        },
        budgetTransactions: {
          orderBy: { transactionDate: 'desc' },
        },
        risks: {
          orderBy: { createdAt: 'desc' },
        },
        anomalies: {
          orderBy: { detectedAt: 'desc' },
        },
        documents: {
          include: {
            uploadedBy: {
              select: { id: true, name: true },
            },
          },
          orderBy: { uploadedAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new Error('Project not found.');
    }

    return project;
  }

  static async createProject(data: {
    name: string;
    description: string;
    departmentId: string;
    projectManagerId?: string;
    location: string;
    latitude?: number;
    longitude?: number;
    startDate: string | Date;
    expectedCompletionDate: string | Date;
    status?: string;
    allocatedBudget: number;
    utilizedBudget?: number;
    priority?: string;
  }) {
    const start = new Date(data.startDate);
    const expected = new Date(data.expectedCompletionDate);

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        departmentId: data.departmentId,
        projectManagerId: data.projectManagerId || null,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        startDate: start,
        expectedCompletionDate: expected,
        status: data.status || 'IN_PROGRESS',
        progressPercentage: 0,
        allocatedBudget: data.allocatedBudget,
        utilizedBudget: data.utilizedBudget || 0,
        priority: data.priority || 'MEDIUM',
        riskScore: 15,
      },
      include: {
        department: true,
        projectManager: true,
      },
    });

    return project;
  }

  static async updateProject(id: string, data: Partial<{
    name: string;
    description: string;
    departmentId: string;
    projectManagerId: string;
    location: string;
    latitude: number;
    longitude: number;
    startDate: string | Date;
    expectedCompletionDate: string | Date;
    actualCompletionDate: string | Date | null;
    status: string;
    progressPercentage: number;
    allocatedBudget: number;
    utilizedBudget: number;
    priority: string;
  }>) {
    const updatePayload: any = { ...data };

    if (data.startDate) updatePayload.startDate = new Date(data.startDate);
    if (data.expectedCompletionDate) updatePayload.expectedCompletionDate = new Date(data.expectedCompletionDate);
    if (data.actualCompletionDate) updatePayload.actualCompletionDate = new Date(data.actualCompletionDate);

    const updated = await prisma.project.update({
      where: { id },
      data: updatePayload,
      include: {
        department: true,
        milestones: true,
        risks: true,
        anomalies: true,
      },
    });

    // Recalculate risk score
    const riskResult = calculateProjectRisk(updated);
    if (Math.abs(updated.riskScore - riskResult.score) >= 2) {
      await prisma.project.update({
        where: { id },
        data: { riskScore: riskResult.score },
      });
      updated.riskScore = riskResult.score;
    }

    return updated;
  }

  static async updateProgress(id: string, progressPercentage: number, status?: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { milestones: true, risks: true, anomalies: true },
    });

    if (!project) throw new Error('Project not found.');

    const newStatus = status || (progressPercentage >= 100 ? 'COMPLETED' : project.status);
    const actualCompletionDate = progressPercentage >= 100 ? new Date() : null;

    const updated = await prisma.project.update({
      where: { id },
      data: {
        progressPercentage,
        status: newStatus,
        actualCompletionDate: actualCompletionDate || project.actualCompletionDate,
      },
      include: { department: true, milestones: true, risks: true, anomalies: true },
    });

    // Recalculate Risk Score
    const risk = calculateProjectRisk(updated);
    await prisma.project.update({
      where: { id },
      data: { riskScore: risk.score },
    });
    updated.riskScore = risk.score;

    return updated;
  }

  static async deleteProject(id: string) {
    return prisma.project.delete({
      where: { id },
    });
  }

  static async getDashboardStats() {
    const now = new Date();

    const [
      totalProjects,
      activeProjects,
      completedProjects,
      delayedProjectsCount,
      highRiskProjects,
      criticalRiskProjects,
      budgetAggregates,
      allProjects,
    ] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.project.count({ where: { status: 'COMPLETED' } }),
      prisma.project.count({
        where: {
          OR: [
            { status: 'DELAYED' },
            {
              status: { not: 'COMPLETED' },
              expectedCompletionDate: { lt: now },
            },
          ],
        },
      }),
      prisma.project.count({ where: { riskScore: { gte: 61, lte: 80 } } }),
      prisma.project.count({ where: { riskScore: { gt: 80 } } }),
      prisma.project.aggregate({
        _sum: {
          allocatedBudget: true,
          utilizedBudget: true,
        },
        _avg: {
          progressPercentage: true,
          riskScore: true,
        },
      }),
      prisma.project.findMany({
        select: {
          id: true,
          name: true,
          status: true,
          progressPercentage: true,
          riskScore: true,
          allocatedBudget: true,
          utilizedBudget: true,
          department: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
    ]);

    const totalAllocatedBudget = budgetAggregates._sum.allocatedBudget || 0;
    const totalBudgetUtilized = budgetAggregates._sum.utilizedBudget || 0;
    const avgProgress = budgetAggregates._avg.progressPercentage || 0;
    const avgRiskScore = budgetAggregates._avg.riskScore || 0;

    // Overall Health Score: Inverse of average risk score
    const overallHealthScore = Math.max(0, Math.min(100, Math.round(100 - avgRiskScore)));

    // Project Status Distribution
    const statusDistribution = [
      { name: 'In Progress', count: activeProjects, color: '#3b82f6' },
      { name: 'Completed', count: completedProjects, color: '#10b981' },
      { name: 'Delayed', count: delayedProjectsCount, color: '#ef4444' },
      { name: 'Not Started', count: Math.max(0, totalProjects - activeProjects - completedProjects - delayedProjectsCount), color: '#94a3b8' },
    ];

    // Project Health Breakdown
    const healthDistribution = [
      { name: 'Healthy (0-30)', count: allProjects.filter(p => p.riskScore <= 30).length, color: '#10b981' },
      { name: 'Moderate (31-60)', count: allProjects.filter(p => p.riskScore > 30 && p.riskScore <= 60).length, color: '#f59e0b' },
      { name: 'High Risk (61-80)', count: highRiskProjects, color: '#f97316' },
      { name: 'Critical (81-100)', count: criticalRiskProjects, color: '#ef4444' },
    ];

    return {
      kpis: {
        totalProjects,
        activeProjects,
        completedProjects,
        delayedProjects: delayedProjectsCount,
        highRiskProjects: highRiskProjects + criticalRiskProjects,
        totalAllocatedBudget,
        totalBudgetUtilized,
        remainingBudget: Math.max(0, totalAllocatedBudget - totalBudgetUtilized),
        budgetUtilizationPercentage: totalAllocatedBudget > 0 ? (totalBudgetUtilized / totalAllocatedBudget) * 100 : 0,
        averageProgress: avgProgress,
        overallProjectHealth: overallHealthScore,
      },
      statusDistribution,
      healthDistribution,
    };
  }
}
