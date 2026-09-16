import { prisma } from '../utils/prisma';
import { predictProjectDelay } from '../ai/delayPrediction';
import { predictCostOverrun } from '../ai/costPrediction';
import { generateProjectSummary } from '../ai/projectSummary';
import { processNaturalLanguageQuery } from '../ai/naturalLanguageQuery';

export class AIService {
  static async getProjectDelayPrediction(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        milestones: {
          orderBy: { expectedCompletionDate: 'asc' },
        },
      },
    });

    if (!project) throw new Error('Project not found');

    const prediction = predictProjectDelay(project);
    return {
      projectId: project.id,
      projectName: project.name,
      ...prediction,
    };
  }

  static async getProjectCostPrediction(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) throw new Error('Project not found');

    const prediction = predictCostOverrun(project);
    return {
      projectId: project.id,
      projectName: project.name,
      ...prediction,
    };
  }

  static async getProjectSummary(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        department: true,
        milestones: true,
        risks: true,
      },
    });

    if (!project) throw new Error('Project not found');

    const summary = generateProjectSummary({
      ...project,
      departmentName: project.department.name,
    });

    return {
      projectId: project.id,
      projectName: project.name,
      ...summary,
    };
  }

  static async handleNaturalLanguageQuery(query: string) {
    if (!query || query.trim().length === 0) {
      throw new Error('Query string cannot be empty.');
    }

    return processNaturalLanguageQuery(query, prisma);
  }
}
