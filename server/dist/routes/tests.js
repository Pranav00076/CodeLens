import { Router } from 'express';
import { TestController } from '../controllers/testController.js';
const router = Router({ mergeParams: true });
router.post('/generate', TestController.generateTests);
router.get('/', TestController.getTests);
export default router;
