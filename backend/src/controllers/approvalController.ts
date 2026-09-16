import { Request, Response, NextFunction } from 'express';
import { ApprovalService } from '../services/approvalService';

export class ApprovalController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { status, projectId, type } = req.query;
      const approvals = await ApprovalService.listApprovals(req.user, {
        status: status as string,
        projectId: projectId as string,
        type: type as string,
      });

      res.json({ success: true, data: approvals });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { projectId, type, title, description, payload } = req.body;
      if (!projectId || !type || !title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Project, type, title, and description are required.',
        });
      }

      const approval = await ApprovalService.createApproval(req.user, {
        projectId,
        type,
        title,
        description,
        payload,
      });

      res.status(201).json({
        success: true,
        data: approval,
        message: 'Approval request submitted successfully to department administration.',
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async review(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { id } = req.params;
      const { action, reviewNotes } = req.body;

      if (!action || (action !== 'APPROVE' && action !== 'REJECT')) {
        return res.status(400).json({
          success: false,
          message: 'Action must be APPROVE or REJECT.',
        });
      }

      const result = await ApprovalService.reviewApproval(req.user, id, action, reviewNotes);
      res.json({
        success: true,
        data: result,
        message: `Request successfully ${action === 'APPROVE' ? 'approved' : 'rejected'}.`,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async stats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const stats = await ApprovalService.getStats(req.user);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
