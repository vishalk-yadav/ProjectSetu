import { Request, Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { logAudit } from '../utils/auditLogger';

export class DiscussionController {
  static async listByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;

      const discussions = await prisma.projectDiscussion.findMany({
        where: { projectId },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      res.json({ success: true, data: discussions });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
      }

      const { projectId } = req.params;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Message content cannot be empty.' });
      }

      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true },
      });

      if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found.' });
      }

      const discussion = await prisma.projectDiscussion.create({
        data: {
          projectId,
          userId: req.user.id,
          senderName: req.user.name,
          senderRole: req.user.role,
          message: message.trim(),
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      });

      await logAudit({
        user: req.user,
        action: 'PROJECT_COMMUNICATION',
        entityType: 'PROJECT',
        entityId: projectId,
        details: `Posted communication note on ${project.name}: "${message.substring(0, 50)}..."`,
      });

      res.status(201).json({ success: true, data: discussion });
    } catch (error) {
      next(error);
    }
  }
}
