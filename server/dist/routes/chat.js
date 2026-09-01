import { Router } from 'express';
import { ChatController } from '../controllers/chatController.js';
const router = Router({ mergeParams: true });
router.post('/', ChatController.askQuestion);
router.get('/', ChatController.getHistory);
router.delete('/', ChatController.clearHistory);
export default router;
