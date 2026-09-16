import { Router } from 'express';
import { RiskController } from '../controllers/riskController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', RiskController.getPortfolioRisk);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), RiskController.addRisk);
router.post('/raise', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), RiskController.raiseAlert);
router.put('/:id/status', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), RiskController.updateStatus);

export default router;
