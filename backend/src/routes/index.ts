import { Router } from 'express';
import authRoutes from './authRoutes';
import projectRoutes from './projectRoutes';
import departmentRoutes from './departmentRoutes';
import milestoneRoutes from './milestoneRoutes';
import budgetRoutes from './budgetRoutes';
import riskRoutes from './riskRoutes';
import aiRoutes from './aiRoutes';
import notificationRoutes from './notificationRoutes';
import documentRoutes from './documentRoutes';
import reportRoutes from './reportRoutes';
import searchRoutes from './searchRoutes';
import complaintRoutes from './complaintRoutes';
import userRoutes from './userRoutes';
import auditRoutes from './auditRoutes';
import approvalRoutes from './approvalRoutes';
import discussionRoutes from './discussionRoutes';
import systemSettingRoutes from './systemSettingRoutes';
import publicRoutes from './publicRoutes';

const apiRouter = Router();

apiRouter.use('/public', publicRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/projects', discussionRoutes);
apiRouter.use('/departments', departmentRoutes);
apiRouter.use('/milestones', milestoneRoutes);
apiRouter.use('/budget', budgetRoutes);
apiRouter.use('/risks', riskRoutes);
apiRouter.use('/ai', aiRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/documents', documentRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/search', searchRoutes);
apiRouter.use('/complaints', complaintRoutes);
apiRouter.use('/grievances', complaintRoutes);
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/approvals', approvalRoutes);
apiRouter.use('/settings', systemSettingRoutes);

// Health check endpoint
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'ProjectSetu Integrated Government Monitoring API v1.0',
  });
});

export default apiRouter;
