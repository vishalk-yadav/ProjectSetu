import { Router } from 'express';
import { ComplaintController } from '../controllers/complaintController';
import { authenticate, authorize, optionalAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Stats endpoint
router.get('/stats', optionalAuth, ComplaintController.getStats);

// Map markers (all geocoded grievances)
router.get('/map', optionalAuth, ComplaintController.getMapMarkers);

// Project specific grievances
router.get('/project/:id', optionalAuth, ComplaintController.getByProjectId);

// List grievances (supports filters: projectId, status, severity, category, search, hasLocation)
router.get('/', optionalAuth, ComplaintController.list);

// Single grievance detail by ID or trackingId
router.get('/:id', optionalAuth, ComplaintController.getById);

// Submit new grievance (Open to public citizens or authenticated users, with photo upload)
router.post('/', optionalAuth, upload.single('photo'), ComplaintController.create);

// Update grievance status (Admins and PMs)
router.patch(
  '/:id/status',
  authenticate,
  authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'),
  ComplaintController.updateStatus
);

router.put(
  '/:id/status',
  authenticate,
  authorize('SUPER_ADMIN', 'DEPARTMENT_ADMIN', 'PROJECT_MANAGER'),
  ComplaintController.updateStatus
);

export default router;
