import { Router } from 'express';
import { DepartmentController } from '../controllers/departmentController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', DepartmentController.list);
router.get('/rankings', DepartmentController.rankings);
router.get('/:id', DepartmentController.getById);

router.post('/', authenticate, authorize('SUPER_ADMIN'), DepartmentController.create);
router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN'), DepartmentController.update);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), DepartmentController.delete);

export default router;
