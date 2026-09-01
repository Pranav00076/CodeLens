import path from 'path';
import fs from 'fs';
import { dbService } from '../services/dbService.js';
import { AIProviderFactory } from '../ai/providerFactory.js';
import { DEMO_FILES } from '../services/demoDataService.js';
import { config } from '../config.js';
export class TestController {
    static async generateTests(req, res) {
        const id = req.params.id;
        const { targetFile, targetFunction, framework = 'Vitest' } = req.body;
        if (!targetFile) {
            res.status(400).json({ success: false, error: 'targetFile is required' });
            return;
        }
        const repo = dbService.getRepo(id);
        if (!repo) {
            res.status(404).json({ success: false, error: 'Repository not found' });
            return;
        }
        // Get file content
        let fileContent = '';
        if (repo.source === 'demo' || id.startsWith('demo-')) {
            fileContent = DEMO_FILES[targetFile] || `export function executeOperation() {\n  return { success: true };\n}`;
        }
        else {
            const repoDir = path.join(config.reposDir, id);
            const filePath = path.resolve(repoDir, targetFile);
            if (fs.existsSync(filePath) && filePath.startsWith(path.normalize(repoDir))) {
                fileContent = fs.readFileSync(filePath, 'utf-8');
            }
            else {
                fileContent = `// File: ${targetFile}\nexport function processData(input: any) {\n  return input;\n}`;
            }
        }
        const aiContext = {
            repoName: repo.name,
            languages: repo.languages,
            frameworks: repo.frameworks,
            entryPoints: repo.entryPoints,
            fileOutline: repo.summary,
            keyFiles: [{ path: targetFile, sampleContent: fileContent, lines: fileContent.split('\n').length }],
        };
        try {
            const aiProvider = AIProviderFactory.getProvider();
            const testResult = await aiProvider.generateTests(aiContext, targetFile, fileContent, targetFunction, framework);
            dbService.addTest(id, testResult);
            res.json({
                success: true,
                data: testResult,
            });
        }
        catch (err) {
            console.error('Test generation error:', err);
            res.status(500).json({ success: false, error: err.message || 'Failed to generate test cases' });
        }
    }
    static getTests(req, res) {
        const id = req.params.id;
        const tests = dbService.getTests(id);
        res.json({ success: true, data: tests });
    }
}
