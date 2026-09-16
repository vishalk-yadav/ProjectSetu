import { prisma } from '../utils/prisma';
import { calculateProjectRisk } from '../ai/riskEngine';

export class MilestoneService {
  static async listMilestonesByProject(projectId: string) {
    const milestones = await prisma.milestone.findMany({
      where: { projectId },
      orderBy: { expectedCompletionDate: 'asc' },
    });

    const now = new Date();

    // Auto check overdue status
    return milestones.map(m => {
      const isOverdue = m.status !== 'COMPLETED' && new Date(m.expectedCompletionDate) < now;
      return {
        ...m,
        isOverdue,
        displayStatus: isOverdue ? 'DELAYED' : m.status,
      };
    });
  }

  static async createMilestone(data: {
    projectId: string;
    name: string;
    description: string;
    expectedCompletionDate: string | Date;
    progressPercentage?: number;
    responsiblePerson: string;
    priority?: string;
  }) {
    const expected = new Date(data.expectedCompletionDate);
    const now = new Date();
    const isPast = expected < now;

    const milestone = await prisma.milestone.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        expectedCompletionDate: expected,
        progressPercentage: data.progressPercentage || 0,
        status: isPast ? 'DELAYED' : 'NOT_STARTED',
        responsiblePerson: data.responsiblePerson,
        priority: data.priority || 'MEDIUM',
      },
    });

    await this.syncProjectMilestoneState(data.projectId);
    return milestone;
  }

  static async updateMilestone(id: string, data: Partial<{
    name: string;
    description: string;
    expectedCompletionDate: string | Date;
    actualCompletionDate: string | Date | null;
    status: string;
    progressPercentage: number;
    responsiblePerson: string;
    priority: string;
  }>) {
    const updateData: any = { ...data };

    if (data.expectedCompletionDate) {
      updateData.expectedCompletionDate = new Date(data.expectedCompletionDate);
    }

    if (data.actualCompletionDate) {
      updateData.actualCompletionDate = new Date(data.actualCompletionDate);
    }

    if (data.status === 'COMPLETED' && !data.actualCompletionDate) {
      updateData.actualCompletionDate = new Date();
      updateData.progressPercentage = 100;
    }

    const milestone = await prisma.milestone.update({
      where: { id },
      data: updateData,
    });

    await this.syncProjectMilestoneState(milestone.projectId);
    return milestone;
  }

  static async deleteMilestone(id: string) {
    const milestone = await prisma.milestone.findUnique({ where: { id } });
    if (!milestone) throw new Error('Milestone not found');

    const projectId = milestone.projectId;
    await prisma.milestone.delete({ where: { id } });
    await this.syncProjectMilestoneState(projectId);
    return { success: true };
  }

  // Recalculates average progress and updates project risk score
  private static async syncProjectMilestoneState(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: true,
        risks: true,
        anomalies: true,
      },
    });

    if (!project) return;

    if (project.milestones.length > 0) {
      const avgProg = Math.round(
        project.milestones.reduce((sum, m) => sum + m.progressPercentage, 0) / project.milestones.length
      );

      // Recalculate project risk
      const risk = calculateProjectRisk({
        ...project,
        progressPercentage: avgProg,
      });

      await prisma.project.update({
        where: { id: projectId },
        data: {
          progressPercentage: avgProg,
          riskScore: risk.score,
        },
      });
    }
  }
}
