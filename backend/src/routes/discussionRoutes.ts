import { Router } from 'express';
import { DiscussionController } from '../controllers/discussionController';
import { authenticate } from '../middleware/auth';

const router = Router({ mergeParams: true });

router.get('/:projectId/discussions', authenticate, DiscussionController.listByProject);
router.post('/:projectId/discussions', authenticate, DiscussionController.create);

export default router;
