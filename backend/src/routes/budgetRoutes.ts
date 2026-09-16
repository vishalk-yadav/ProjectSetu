import { Router } from 'express';
import { BudgetController } from '../controllers/budgetController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/summary', BudgetController.getPortfolioSummary);
router.get('/project/:projectId', BudgetController.getProjectBudget);
router.post('/transaction', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), BudgetController.addTransaction);

export default router;
