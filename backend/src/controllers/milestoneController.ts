import { Request, Response, NextFunction } from 'express';
import { MilestoneService } from '../services/milestoneService';

export class MilestoneController {
  static async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const milestones = await MilestoneService.listMilestonesByProject(req.params.projectId);
      res.json({ success: true, data: milestones });
    } catch (error: any) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, expectedCompletionDate, progressPercentage, responsiblePerson, priority } = req.body;
      if (!name || !expectedCompletionDate || !responsiblePerson) {
        res.status(400).json({ success: false, message: 'Name, expectedCompletionDate, and responsiblePerson are required.' });
        return;
      }

      const milestone = await MilestoneService.createMilestone({
        projectId: req.params.projectId,
        name,
        description: description || '',
        expectedCompletionDate,
        progressPercentage: progressPercentage !== undefined ? parseFloat(progressPercentage) : 0,
        responsiblePerson,
        priority,
      });

      res.status(201).json({ success: true, data: milestone });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await MilestoneService.updateMilestone(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await MilestoneService.deleteMilestone(req.params.id);
      res.json({ success: true, message: 'Milestone deleted successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
