import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { MilestoneController } from '../controllers/milestoneController';
import { RiskController } from '../controllers/riskController';
import { AIController } from '../controllers/aiController';
import { BudgetController } from '../controllers/budgetController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Stats
router.get('/stats/dashboard', ProjectController.getDashboardStats);

// List & Detail
router.get('/', ProjectController.list);
router.get('/:id', ProjectController.getById);

// Create (Dept Admin, Super Admin only - Project Managers cannot sanction projects)
router.post('/', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), ProjectController.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), ProjectController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), ProjectController.delete);

// Progress update
router.put('/:id/progress', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), ProjectController.updateProgress);

// Milestones nested endpoints
router.get('/:projectId/milestones', MilestoneController.listByProject);
router.post('/:projectId/milestones', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), MilestoneController.create);

// Budget nested endpoint
router.get('/:projectId/budget', BudgetController.getProjectBudget);

// Risk & AI nested endpoints
router.get('/:id/risk', RiskController.getProjectRisk);
router.post('/:id/analyze', RiskController.analyzeProject);
router.get('/:id/delay-prediction', AIController.getDelayPrediction);
router.get('/:id/cost-prediction', AIController.getCostPrediction);
router.get('/:id/summary', AIController.getSummary);

export default router;
