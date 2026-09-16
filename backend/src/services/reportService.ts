import { prisma } from '../utils/prisma';

export class ReportService {
  static async generateReport(params: {
    reportType: 'ALL_PROJECTS' | 'DELAYED_PROJECTS' | 'HIGH_RISK' | 'BUDGET_ANALYSIS' | 'DEPARTMENT_SUMMARY';
    departmentId?: string;
  }) {
    const where: any = {};
    if (params.departmentId) {
      where.departmentId = params.departmentId;
    }

    const now = new Date();

    if (params.reportType === 'DELAYED_PROJECTS') {
      where.OR = [
        { status: 'DELAYED' },
        { status: { not: 'COMPLETED' }, expectedCompletionDate: { lt: now } },
      ];
    } else if (params.reportType === 'HIGH_RISK') {
      where.riskScore = { gte: 61 };
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        department: true,
        projectManager: true,
        milestones: true,
      },
      orderBy: { riskScore: 'desc' },
    });

    const rows = projects.map(p => {
      const budgetUtil = p.allocatedBudget > 0 ? (p.utilizedBudget / p.allocatedBudget) * 100 : 0;
      const daysRemaining = Math.round((new Date(p.expectedCompletionDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: p.id,
        name: p.name,
        department: p.department.name,
        departmentCode: p.department.code,
        status: p.status,
        priority: p.priority,
        progress: `${p.progressPercentage}%`,
        allocatedBudgetINR: p.allocatedBudget,
        allocatedBudgetCr: Number((p.allocatedBudget / 10000000).toFixed(2)),
        utilizedBudgetINR: p.utilizedBudget,
        utilizedBudgetCr: Number((p.utilizedBudget / 10000000).toFixed(2)),
        budgetUtilization: `${budgetUtil.toFixed(1)}%`,
        riskScore: p.riskScore,
        location: p.location,
        startDate: p.startDate.toISOString().split('T')[0],
        deadline: p.expectedCompletionDate.toISOString().split('T')[0],
        scheduleStatus: daysRemaining < 0 ? `Overdue by ${Math.abs(daysRemaining)} days` : `${daysRemaining} days remaining`,
      };
    });

    return {
      reportType: params.reportType,
      generatedAt: new Date().toISOString(),
      totalRecords: rows.length,
      data: rows,
    };
  }

  static async exportToCsv(params: {
    reportType: 'ALL_PROJECTS' | 'DELAYED_PROJECTS' | 'HIGH_RISK' | 'BUDGET_ANALYSIS' | 'DEPARTMENT_SUMMARY';
    departmentId?: string;
  }): Promise<string> {
    const report = await this.generateReport(params);
    const headers = [
      'Project ID',
      'Project Name',
      'Ministry / Department',
      'Code',
      'Status',
      'Priority',
      'Physical Progress',
      'Allocated Budget (Cr)',
      'Utilized Budget (Cr)',
      'Budget Utilization',
      'Risk Score (0-100)',
      'Location',
      'Start Date',
      'Deadline',
      'Schedule Status',
    ];

    const lines: string[] = [headers.join(',')];

    for (const r of report.data) {
      const line = [
        `"${r.id}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.department.replace(/"/g, '""')}"`,
        `"${r.departmentCode}"`,
        `"${r.status}"`,
        `"${r.priority}"`,
        `"${r.progress}"`,
        r.allocatedBudgetCr,
        r.utilizedBudgetCr,
        `"${r.budgetUtilization}"`,
        r.riskScore,
        `"${r.location.replace(/"/g, '""')}"`,
        `"${r.startDate}"`,
        `"${r.deadline}"`,
        `"${r.scheduleStatus}"`,
      ];
      lines.push(line.join(','));
    }

    return lines.join('\n');
  }
}
