import { Router } from 'express';
import { PublicController } from '../controllers/publicController';
import { upload } from '../middleware/upload';

const router = Router();

// Public Projects
router.get('/projects', PublicController.listProjects);
router.get('/projects/:id', PublicController.getProjectById);

// Public Grievances (Both /complaints and /grievances aliases)
router.post('/complaints', upload.single('photo'), PublicController.submitGrievance);
router.post('/grievances', upload.single('photo'), PublicController.submitGrievance);
router.get('/complaints/track/:trackingId', PublicController.trackGrievance);
router.get('/grievances/track/:trackingId', PublicController.trackGrievance);

// Public Documents & Circulars
router.get('/documents', PublicController.listDocuments);

export default router;
