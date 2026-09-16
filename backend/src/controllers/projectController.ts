import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/projectService';

export class ProjectController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        departmentId,
        status,
        riskLevel,
        priority,
        search,
        page,
        limit,
        sortBy,
        sortOrder,
      } = req.query;

      const result = await ProjectService.listProjects({
        departmentId: departmentId as string,
        status: status as string,
        riskLevel: riskLevel as string,
        priority: priority as string,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      res.json({ success: true, data: result.projects, pagination: result.pagination });
    } catch (error: any) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.getProjectById(req.params.id);
      res.json({ success: true, data: project });
    } catch (error: any) {
      if (error.message === 'Project not found.') {
        res.status(404).json({ success: false, message: error.message });
      } else {
        next(error);
      }
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.body);
      res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ProjectService.updateProject(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const { progressPercentage, status } = req.body;
      if (progressPercentage === undefined) {
        res.status(400).json({ success: false, message: 'progressPercentage is required.' });
        return;
      }

      const updated = await ProjectService.updateProgress(
        req.params.id,
        parseFloat(progressPercentage),
        status
      );
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ProjectService.deleteProject(req.params.id);
      res.json({ success: true, message: 'Project deleted successfully.' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await ProjectService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      next(error);
    }
  }
}
