import { Router } from 'express';
import multer from 'multer';
import { AnalyzeController } from '../controllers/analyzeController.js';
import { config } from '../config.js';
const router = Router();
const upload = multer({
    dest: config.tempDir,
    limits: {
        fileSize: config.maxRepoSizeMB * 1024 * 1024,
    },
});
router.get('/demo', AnalyzeController.getDemo);
router.post('/github', AnalyzeController.analyzeGithub);
router.post('/upload', upload.single('file'), AnalyzeController.analyzeZip);
export default router;
