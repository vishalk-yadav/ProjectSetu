import { prisma } from '../utils/prisma';

export class DepartmentService {
  static async listDepartments() {
    const departments = await prisma.department.findMany({
      include: {
        projects: {
          select: {
            id: true,
            status: true,
            progressPercentage: true,
            allocatedBudget: true,
            utilizedBudget: true,
            riskScore: true,
            expectedCompletionDate: true,
          },
        },
        _count: {
          select: {
            users: true,
            projects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const now = new Date();

    return departments.map(d => {
      const totalProjects = d.projects.length;
      const activeProjects = d.projects.filter(p => p.status === 'IN_PROGRESS').length;
      const completedProjects = d.projects.filter(p => p.status === 'COMPLETED').length;
      const delayedProjects = d.projects.filter(p => {
        if (p.status === 'COMPLETED') return false;
        return p.status === 'DELAYED' || new Date(p.expectedCompletionDate) < now;
      }).length;

      const totalProgress = d.projects.reduce((sum, p) => sum + p.progressPercentage, 0);
      const avgProgress = totalProjects > 0 ? totalProgress / totalProjects : 0;

      const totalAllocated = d.projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
      const totalUtilized = d.projects.reduce((sum, p) => sum + p.utilizedBudget, 0);
      const budgetUtilization = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

      const totalRisk = d.projects.reduce((sum, p) => sum + p.riskScore, 0);
      const avgRisk = totalProjects > 0 ? totalRisk / totalProjects : 0;

      const completionRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

      return {
        id: d.id,
        name: d.name,
        code: d.code,
        departmentHead: d.departmentHead,
        contactInformation: d.contactInformation,
        totalUsers: d._count.users,
        stats: {
          totalProjects,
          activeProjects,
          completedProjects,
          delayedProjects,
          avgProgress: Number(avgProgress.toFixed(1)),
          totalAllocatedBudget: totalAllocated,
          totalBudgetUtilized: totalUtilized,
          budgetUtilizationPercentage: Number(budgetUtilization.toFixed(1)),
          avgRiskScore: Number(avgRisk.toFixed(1)),
          completionRate: Number(completionRate.toFixed(1)),
        },
      };
    });
  }

  static async getDepartmentById(id: string) {
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        projects: {
          include: {
            projectManager: {
              select: { id: true, name: true },
            },
          },
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!department) {
      throw new Error('Department not found.');
    }

    const now = new Date();
    const totalProjects = department.projects.length;
    const activeProjects = department.projects.filter(p => p.status === 'IN_PROGRESS').length;
    const completedProjects = department.projects.filter(p => p.status === 'COMPLETED').length;
    const delayedProjects = department.projects.filter(p => {
      if (p.status === 'COMPLETED') return false;
      return p.status === 'DELAYED' || new Date(p.expectedCompletionDate) < now;
    }).length;

    const totalAllocated = department.projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
    const totalUtilized = department.projects.reduce((sum, p) => sum + p.utilizedBudget, 0);

    return {
      ...department,
      stats: {
        totalProjects,
        activeProjects,
        completedProjects,
        delayedProjects,
        totalAllocated,
        totalUtilized,
        budgetUtilization: totalAllocated > 0 ? Number(((totalUtilized / totalAllocated) * 100).toFixed(1)) : 0,
        avgRisk: totalProjects > 0 ? Number((department.projects.reduce((s, p) => s + p.riskScore, 0) / totalProjects).toFixed(1)) : 0,
      },
    };
  }

  static async createDepartment(data: {
    name: string;
    code: string;
    departmentHead: string;
    contactInformation: string;
  }) {
    const existing = await prisma.department.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      throw new Error(`Department code ${data.code} already exists.`);
    }

    return prisma.department.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase(),
        departmentHead: data.departmentHead,
        contactInformation: data.contactInformation,
      },
    });
  }

  static async updateDepartment(id: string, data: Partial<{
    name: string;
    code: string;
    departmentHead: string;
    contactInformation: string;
  }>) {
    return prisma.department.update({
      where: { id },
      data: {
        ...data,
        code: data.code ? data.code.toUpperCase() : undefined,
      },
    });
  }

  static async deleteDepartment(id: string) {
    return prisma.department.delete({
      where: { id },
    });
  }

  static async getDepartmentRankings() {
    const departments = await this.listDepartments();

    // Composite Performance Score formula:
    // (Completion Rate * 0.35) + (Avg Progress * 0.35) + ((100 - Avg Risk) * 0.20) + ((1 - DelayedRatio) * 10)
    return departments
      .map(d => {
        const delayedRatio = d.stats.totalProjects > 0 ? d.stats.delayedProjects / d.stats.totalProjects : 0;
        const delayedScore = Math.max(0, (1 - delayedRatio) * 10);
        const performanceScore = Math.round(
          (d.stats.completionRate * 0.35) +
          (d.stats.avgProgress * 0.35) +
          ((100 - d.stats.avgRiskScore) * 0.20) +
          delayedScore
        );

        return {
          id: d.id,
          name: d.name,
          code: d.code,
          departmentHead: d.departmentHead,
          stats: d.stats,
          performanceScore: Math.min(100, Math.max(10, performanceScore)),
        };
      })
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .map((d, index) => ({
        ...d,
        rank: index + 1,
      }));
  }
}
