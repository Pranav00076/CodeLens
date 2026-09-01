import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { GitService } from '../services/gitService.js';
import { ZipService } from '../services/zipService.js';
import { ScannerService } from '../services/scannerService.js';
import { ChunkerService } from '../services/chunkerService.js';
import { DomainParserService } from '../services/domainParserService.js';
import { DemoDataService } from '../services/demoDataService.js';
import { dbService } from '../services/dbService.js';
import { AIProviderFactory } from '../ai/providerFactory.js';
import { config } from '../config.js';
export class AnalyzeController {
    /**
     * Returns instant demo repository analysis
     */
    static async getDemo(req, res) {
        try {
            const demo = DemoDataService.getDemoAnalysis();
            dbService.saveRepo(demo);
            res.json({ success: true, data: demo });
        }
        catch (err) {
            console.error('Demo load error:', err);
            res.status(500).json({ success: false, error: err.message || 'Failed to load demo repository' });
        }
    }
    /**
     * Clones and analyzes a public GitHub / Git repository
     */
    static async analyzeGithub(req, res) {
        const { url } = req.body;
        if (!url) {
            res.status(400).json({ success: false, error: 'Repository URL is required' });
            return;
        }
        const validation = GitService.validateAndNormalizeUrl(url);
        if (!validation.valid || !validation.normalizedUrl) {
            res.status(400).json({ success: false, error: validation.error || 'Invalid repository URL' });
            return;
        }
        const repoId = `repo-${uuidv4().slice(0, 8)}`;
        const targetDir = path.join(config.reposDir, repoId);
        try {
            // 1. Clone
            const cloneResult = await GitService.cloneRepository(validation.normalizedUrl, targetDir);
            if (!cloneResult.success) {
                res.status(400).json({ success: false, error: cloneResult.error });
                return;
            }
            const scanRoot = cloneResult.rootDir || targetDir;
            // 2. Scan directory
            const scanResult = ScannerService.scanDirectory(scanRoot);
            // 3. Extract Deep Domain Metadata from README & Manifests
            const domainMeta = DomainParserService.extractDomainMetadata(scanRoot, scanResult.allScannedFiles);
            // 4. Prioritize Key Files (README, Manifests, Entry Points, Core Modules)
            const prioritizedFiles = AnalyzeController.prioritizeFiles(scanResult.allScannedFiles, scanResult.entryPoints, domainMeta);
            const fileOutline = ChunkerService.generateRepoContextSummary(scanResult.allScannedFiles);
            const aiContext = {
                repoName: validation.repoName || path.basename(targetDir),
                languages: scanResult.languages,
                frameworks: scanResult.frameworks,
                entryPoints: scanResult.entryPoints,
                fileOutline,
                keyFiles: prioritizedFiles,
                domainMeta,
            };
            // 5. Run AI Analysis
            const aiProvider = AIProviderFactory.getProvider();
            const aiResult = await aiProvider.analyzeCodebase(aiContext);
            // 6. Calculate Health Score
            let healthScore = 100;
            aiResult.issues.forEach(issue => {
                if (issue.severity === 'high')
                    healthScore -= 8;
                else if (issue.severity === 'medium')
                    healthScore -= 4;
                else
                    healthScore -= 2;
            });
            scanResult.stats.healthScore = Math.max(45, Math.min(100, healthScore));
            const analysis = {
                id: repoId,
                name: validation.repoName || 'Analyzed Repository',
                source: 'github',
                url: validation.normalizedUrl,
                branch: 'main',
                analyzedAt: new Date().toISOString(),
                summary: aiResult.summary,
                stats: scanResult.stats,
                languages: scanResult.languages,
                frameworks: scanResult.frameworks,
                entryPoints: scanResult.entryPoints,
                architecture: aiResult.architecture,
                fileTree: scanResult.fileTree,
                issues: aiResult.issues,
                onboardingGuide: aiResult.onboardingGuide,
            };
            dbService.saveRepo(analysis);
            res.json({ success: true, data: analysis });
        }
        catch (err) {
            console.error('Analysis error:', err);
            if (fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true, force: true });
            }
            res.status(500).json({ success: false, error: err.message || 'Failed to complete codebase analysis' });
        }
    }
    /**
     * Analyzes an uploaded ZIP archive
     */
    static async analyzeZip(req, res) {
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, error: 'ZIP file is required' });
            return;
        }
        const repoId = `repo-zip-${uuidv4().slice(0, 8)}`;
        const targetDir = path.join(config.reposDir, repoId);
        try {
            // 1. Extract ZIP
            const extractResult = ZipService.extractZip(file.path, targetDir);
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            if (!extractResult.success) {
                res.status(400).json({ success: false, error: extractResult.error });
                return;
            }
            const rootScanDir = extractResult.rootDir;
            // 2. Scan
            const scanResult = ScannerService.scanDirectory(rootScanDir);
            // 3. Extract Deep Domain Metadata from README & Manifests
            const domainMeta = DomainParserService.extractDomainMetadata(rootScanDir, scanResult.allScannedFiles);
            // 4. Prioritize Key Files
            const prioritizedFiles = AnalyzeController.prioritizeFiles(scanResult.allScannedFiles, scanResult.entryPoints, domainMeta);
            const fileOutline = ChunkerService.generateRepoContextSummary(scanResult.allScannedFiles);
            const repoName = file.originalname.replace(/\.zip$/i, '') || 'Uploaded Project';
            const aiContext = {
                repoName,
                languages: scanResult.languages,
                frameworks: scanResult.frameworks,
                entryPoints: scanResult.entryPoints,
                fileOutline,
                keyFiles: prioritizedFiles,
                domainMeta,
            };
            // 5. Run AI Analysis
            const aiProvider = AIProviderFactory.getProvider();
            const aiResult = await aiProvider.analyzeCodebase(aiContext);
            // 6. Calculate Health Score
            let healthScore = 100;
            aiResult.issues.forEach(issue => {
                if (issue.severity === 'high')
                    healthScore -= 8;
                else if (issue.severity === 'medium')
                    healthScore -= 4;
                else
                    healthScore -= 2;
            });
            scanResult.stats.healthScore = Math.max(45, Math.min(100, healthScore));
            const analysis = {
                id: repoId,
                name: repoName,
                source: 'upload',
                analyzedAt: new Date().toISOString(),
                summary: aiResult.summary,
                stats: scanResult.stats,
                languages: scanResult.languages,
                frameworks: scanResult.frameworks,
                entryPoints: scanResult.entryPoints,
                architecture: aiResult.architecture,
                fileTree: scanResult.fileTree,
                issues: aiResult.issues,
                onboardingGuide: aiResult.onboardingGuide,
            };
            dbService.saveRepo(analysis);
            res.json({ success: true, data: analysis });
        }
        catch (err) {
            console.error('ZIP Analysis error:', err);
            if (file && fs.existsSync(file.path))
                fs.unlinkSync(file.path);
            if (fs.existsSync(targetDir))
                fs.rmSync(targetDir, { recursive: true, force: true });
            res.status(500).json({ success: false, error: err.message || 'Failed to analyze uploaded archive' });
        }
    }
    /**
     * Helper to prioritize critical files (README, manifests, entry points, core logic)
     */
    static prioritizeFiles(allFiles, entryPoints, domainMeta) {
        const selected = new Map();
        // 1. First Priority: README & Documentation
        const readme = allFiles.find(f => /(?:^|\/)readme/i.test(f.relativePath));
        if (readme) {
            selected.set(readme.relativePath, { path: readme.relativePath, lines: readme.lines, language: readme.language, sampleContent: readme.sampleContent });
        }
        // 2. Second Priority: Manifests & Configs
        const manifests = allFiles.filter(f => /(?:package\.json|manifest\.json|pyproject\.toml|Cargo\.toml|go\.mod|docker-compose\.ya?ml|schema\.prisma)$/i.test(f.relativePath));
        manifests.forEach(m => selected.set(m.relativePath, { path: m.relativePath, lines: m.lines, language: m.language, sampleContent: m.sampleContent }));
        // 3. Third Priority: Entry Points
        entryPoints.forEach(ep => {
            const match = allFiles.find(f => f.relativePath === ep.path);
            if (match)
                selected.set(match.relativePath, { path: match.relativePath, lines: match.lines, language: match.language, sampleContent: match.sampleContent });
        });
        // 4. Fourth Priority: Core Identified Modules (AI, Core, Services, Controllers, Adapters)
        const coreKeywords = ['/ai/', '/core/', '/services/', '/controllers/', '/routes/', '/models/', '/sites/', '/adapter', '/pipeline', '/state'];
        allFiles.forEach(f => {
            if (selected.size < 35 && coreKeywords.some(k => f.relativePath.toLowerCase().includes(k))) {
                selected.set(f.relativePath, { path: f.relativePath, lines: f.lines, language: f.language, sampleContent: f.sampleContent });
            }
        });
        // 5. Fill remaining up to 35 files
        for (const f of allFiles) {
            if (selected.size >= 35)
                break;
            if (!selected.has(f.relativePath)) {
                selected.set(f.relativePath, { path: f.relativePath, lines: f.lines, language: f.language, sampleContent: f.sampleContent });
            }
        }
        return Array.from(selected.values());
    }
}
