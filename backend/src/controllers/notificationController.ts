import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notificationService';

export class NotificationController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const notifications = await NotificationService.listNotifications(req.user?.id);
      res.json({ success: true, data: notifications });
    } catch (error: any) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await NotificationService.markAsRead(req.params.id);
      res.json({ success: true, data: updated });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationService.markAllAsRead(req.user?.id);
      res.json({ success: true, message: 'All notifications marked as read.' });
    } catch (error: any) {
      next(error);
    }
  }
}
