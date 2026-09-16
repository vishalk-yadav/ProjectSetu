import { Router } from 'express';
import { MilestoneController } from '../controllers/milestoneController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), MilestoneController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), MilestoneController.delete);

export default router;
