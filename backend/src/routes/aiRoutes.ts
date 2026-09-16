import { Router } from 'express';
import { AIController } from '../controllers/aiController';

const router = Router();

router.post('/query', AIController.queryAssistant);
router.get('/delay/:id', AIController.getDelayPrediction);
router.get('/cost/:id', AIController.getCostPrediction);
router.get('/summary/:id', AIController.getSummary);

export default router;
