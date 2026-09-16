import { Router } from 'express';
import { ReportController } from '../controllers/reportController';

const router = Router();

router.get('/', ReportController.getReport);
router.get('/export-csv', ReportController.exportCsv);

export default router;
