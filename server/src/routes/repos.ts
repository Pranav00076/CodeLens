import { Router } from 'express';
import { RepoController } from '../controllers/repoController.js';

const router = Router();

router.get('/', RepoController.getAllRepos);
router.get('/:id', RepoController.getRepo);
router.get('/:id/file', RepoController.getFileContent);
router.get('/:id/export/onboarding', RepoController.exportOnboardingMarkdown);
router.delete('/:id', RepoController.deleteRepo);

export default router;
