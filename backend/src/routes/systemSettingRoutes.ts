import { Router } from 'express';
import { SystemSettingController } from '../controllers/systemSettingController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Super Admin can view and update system configurations
router.get('/', authenticate, SystemSettingController.getAll);
router.put('/', authenticate, authorize('SUPER_ADMIN'), SystemSettingController.updateSettings);

export default router;
