import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/auditService';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        action,
        entityType,
        userId,
        search,
        startDate,
        endDate,
        page,
        limit,
      } = req.query;

      const result = await AuditService.listLogs({
        action: action as string,
        entityType: entityType as string,
        userId: userId as string,
        search: search as string,
        startDate: startDate as string,
        endDate: endDate as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.json({ success: true, data: result.logs, pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }

  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await AuditService.getLogStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
