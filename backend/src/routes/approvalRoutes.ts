import { Router } from 'express';
import { ApprovalController } from '../controllers/approvalController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Stats
router.get('/stats', authenticate, ApprovalController.stats);

// List approvals
router.get('/', authenticate, ApprovalController.list);

// Submit new approval request (Project Managers & Admins)
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'),
  ApprovalController.create
);

// Review approval request (Super Admin & Department Admin only)
router.post(
  '/:id/review',
  authenticate,
  authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'),
  ApprovalController.review
);

export default router;
