import { prisma } from '../utils/prisma';

export class BudgetService {
  static async getPortfolioBudgetSummary() {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        allocatedBudget: true,
        utilizedBudget: true,
        department: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    const totalAllocated = projects.reduce((sum, p) => sum + p.allocatedBudget, 0);
    const totalUtilized = projects.reduce((sum, p) => sum + p.utilizedBudget, 0);
    const remaining = Math.max(0, totalAllocated - totalUtilized);
    const utilizationPct = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;

    // High utilization warning threshold projects (>80%)
    const thresholdExceededProjects = projects
      .filter(p => p.allocatedBudget > 0 && (p.utilizedBudget / p.allocatedBudget) * 100 >= 80)
      .map(p => ({
        id: p.id,
        name: p.name,
        departmentCode: p.department.code,
        allocatedBudget: p.allocatedBudget,
        utilizedBudget: p.utilizedBudget,
        utilizationPercentage: Number(((p.utilizedBudget / p.allocatedBudget) * 100).toFixed(1)),
      }));

    // Department breakdown
    const deptMap = new Map<string, { name: string; code: string; allocated: number; utilized: number }>();
    projects.forEach(p => {
      const dept = p.department;
      if (!deptMap.has(dept.id)) {
        deptMap.set(dept.id, { name: dept.name, code: dept.code, allocated: 0, utilized: 0 });
      }
      const d = deptMap.get(dept.id)!;
      d.allocated += p.allocatedBudget;
      d.utilized += p.utilizedBudget;
    });

    const departmentBudgets = Array.from(deptMap.entries()).map(([id, d]) => ({
      id,
      name: d.name,
      code: d.code,
      allocatedBudget: d.allocated,
      utilizedBudget: d.utilized,
      remainingBudget: Math.max(0, d.allocated - d.utilized),
      utilizationPercentage: d.allocated > 0 ? Number(((d.utilized / d.allocated) * 100).toFixed(1)) : 0,
    }));

    // Recent portfolio transactions
    const recentTransactions = await prisma.budgetTransaction.findMany({
      include: {
        project: {
          select: { id: true, name: true },
        },
      },
      orderBy: { transactionDate: 'desc' },
      take: 10,
    });

    return {
      overview: {
        totalAllocatedBudget: totalAllocated,
        totalBudgetUtilized: totalUtilized,
        remainingBudget: remaining,
        budgetUtilizationPercentage: Number(utilizationPct.toFixed(1)),
        warningProjectsCount: thresholdExceededProjects.length,
      },
      thresholdExceededProjects,
      departmentBudgets,
      recentTransactions,
    };
  }

  static async getProjectBudget(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        budgetTransactions: {
          orderBy: { transactionDate: 'desc' },
        },
      },
    });

    if (!project) throw new Error('Project not found');

    const remainingBudget = Math.max(0, project.allocatedBudget - project.utilizedBudget);
    const utilizationPercentage = project.allocatedBudget > 0
      ? (project.utilizedBudget / project.allocatedBudget) * 100
      : 0;

    // Monthly spending breakdown
    const monthlySpend: { [key: string]: number } = {};
    project.budgetTransactions.forEach(t => {
      const monthYear = new Date(t.transactionDate).toLocaleString('default', { month: 'short', year: 'numeric' });
      monthlySpend[monthYear] = (monthlySpend[monthYear] || 0) + t.amount;
    });

    const monthlyTrends = Object.keys(monthlySpend).map(m => ({
      month: m,
      amount: monthlySpend[m],
    }));

    // Category breakdown
    const categorySpend: { [key: string]: number } = {};
    project.budgetTransactions.forEach(t => {
      categorySpend[t.category] = (categorySpend[t.category] || 0) + t.amount;
    });

    const categoryBreakdown = Object.keys(categorySpend).map(c => ({
      category: c,
      amount: categorySpend[c],
    }));

    return {
      allocatedBudget: project.allocatedBudget,
      utilizedBudget: project.utilizedBudget,
      remainingBudget,
      utilizationPercentage: Number(utilizationPercentage.toFixed(1)),
      warningThresholdExceeded: utilizationPercentage >= 80,
      transactions: project.budgetTransactions,
      monthlyTrends,
      categoryBreakdown,
    };
  }

  static async addTransaction(data: {
    projectId: string;
    amount: number;
    transactionDate?: string | Date;
    category: string;
    description: string;
  }) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project) throw new Error('Project not found');

    const tx = await prisma.budgetTransaction.create({
      data: {
        projectId: data.projectId,
        amount: data.amount,
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
        category: data.category,
        description: data.description,
      },
    });

    // Update utilized budget
    const newUtilized = project.utilizedBudget + data.amount;
    await prisma.project.update({
      where: { id: data.projectId },
      data: { utilizedBudget: newUtilized },
    });

    // Check if utilization passed 80% and trigger notification if so
    const newUtilPct = project.allocatedBudget > 0 ? (newUtilized / project.allocatedBudget) * 100 : 0;
    if (newUtilPct >= 80) {
      await prisma.notification.create({
        data: {
          title: `Budget Warning: ${project.name}`,
          message: `Project budget utilization has reached ${newUtilPct.toFixed(1)}% (Threshold: 80%).`,
          type: 'WARNING',
          severity: 'HIGH',
        },
      });
    }

    return tx;
  }
}
