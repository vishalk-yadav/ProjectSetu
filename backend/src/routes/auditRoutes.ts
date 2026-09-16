import { Router } from 'express';
import { AuditController } from '../controllers/auditController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Audit logs can be viewed by Super Admin and Department Admins
router.get('/', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), AuditController.list);
router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), AuditController.stats);

export default router;
