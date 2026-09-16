import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Project managers list for assignments (accessible to Admins & PMs)
router.get('/project-managers', authenticate, UserController.getProjectManagers);

// User CRUD - Super Admin and Department Admin (scoped)
router.get('/', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), UserController.list);
router.post('/', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), UserController.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), UserController.update);
router.patch('/:id/status', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), UserController.toggleStatus);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), UserController.delete);

export default router;
