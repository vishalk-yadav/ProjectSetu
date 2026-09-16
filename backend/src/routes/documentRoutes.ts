import { Router } from 'express';
import { DocumentController } from '../controllers/documentController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', DocumentController.list);
router.post(
  '/upload',
  authenticate,
  authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'),
  upload.single('file'),
  DocumentController.upload
);
router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'), DocumentController.delete);

export default router;
