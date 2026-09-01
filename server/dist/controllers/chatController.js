import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import { dbService } from '../services/dbService.js';
import { AIProviderFactory } from '../ai/providerFactory.js';
import { DEMO_FILES } from '../services/demoDataService.js';
import { config } from '../config.js';
export class ChatController {
    static async askQuestion(req, res) {
        const id = req.params.id;
        const { question } = req.body;
        if (!question || typeof question !== 'string') {
            res.status(400).json({ success: false, error: 'Question string is required' });
            return;
        }
        const repo = dbService.getRepo(id);
        if (!repo) {
            res.status(404).json({ success: false, error: 'Repository not found' });
            return;
        }
        const userMessage = {
            id: `msg-${uuidv4().slice(0, 8)}`,
            role: 'user',
            content: question,
            timestamp: new Date().toISOString(),
        };
        dbService.addChatMessage(id, userMessage);
        const history = dbService.getChatHistory(id);
        // Prepare context files
        let keyFiles = [];
        const repoDiskDir = path.join(config.reposDir, id);
        if (repo.source === 'demo' || id.startsWith('demo-')) {
            keyFiles = Object.entries(DEMO_FILES).map(([p, content]) => ({
                path: p,
                sampleContent: content,
                language: p.endsWith('.tsx') || p.endsWith('.ts') ? 'TypeScript' : 'Code',
                lines: content.split('\n').length,
            }));
        }
        else if (fs.existsSync(repoDiskDir)) {
            // Collect files from disk
            const collect = (node) => {
                if (node.type === 'file') {
                    const absPath = path.join(repoDiskDir, node.path);
                    let sampleContent = '';
                    if (fs.existsSync(absPath)) {
                        try {
                            sampleContent = fs.readFileSync(absPath, 'utf-8').slice(0, 3000);
                        }
                        catch {
                            // ignore
                        }
                    }
                    keyFiles.push({
                        path: node.path,
                        lines: node.lines || 50,
                        language: node.language || 'Code',
                        sampleContent,
                    });
                }
                else if (node.children) {
                    node.children.forEach(collect);
                }
            };
            collect(repo.fileTree);
        }
        else {
            const collect = (node) => {
                if (node.type === 'file') {
                    keyFiles.push({
                        path: node.path,
                        lines: node.lines || 50,
                        language: node.language || 'Code',
                    });
                }
                else if (node.children) {
                    node.children.forEach(collect);
                }
            };
            collect(repo.fileTree);
        }
        const domainMeta = {
            readmeContent: repo.onboardingGuide.mission,
            readmeTitle: repo.name,
            readmeOverview: repo.summary,
            readmeFeatures: repo.onboardingGuide.mission.includes('•') ? repo.onboardingGuide.mission.split('•').slice(1).map(s => s.trim()) : [],
            readmePrerequisites: repo.onboardingGuide.quickStart.prerequisites,
            readmeCommands: repo.onboardingGuide.quickStart.commands,
            manifestInfo: {
                projectType: repo.architecture.pattern.includes('Chrome') ? 'chrome_extension' : 'general_app',
                keywords: [],
                scripts: {},
                dependencies: repo.frameworks.map(f => f.name),
            },
            identifiedModules: [],
        };
        const aiContext = {
            repoName: repo.name,
            languages: repo.languages,
            frameworks: repo.frameworks,
            entryPoints: repo.entryPoints,
            fileOutline: `Repository ${repo.name} architecture: ${repo.architecture.pattern}\nSummary: ${repo.summary}\nMission: ${repo.onboardingGuide.mission}`,
            keyFiles: keyFiles.slice(0, 25),
            domainMeta,
        };
        try {
            const aiProvider = AIProviderFactory.getProvider();
            const { answer, citations } = await aiProvider.answerQuestion(aiContext, history, question);
            const assistantMessage = {
                id: `msg-${uuidv4().slice(0, 8)}`,
                role: 'assistant',
                content: answer,
                timestamp: new Date().toISOString(),
                citations,
            };
            dbService.addChatMessage(id, assistantMessage);
            res.json({
                success: true,
                data: assistantMessage,
            });
        }
        catch (err) {
            console.error('Chat error:', err);
            res.status(500).json({ success: false, error: err.message || 'Failed to generate response' });
        }
    }
    static getHistory(req, res) {
        const id = req.params.id;
        const history = dbService.getChatHistory(id);
        res.json({ success: true, data: history });
    }
    static clearHistory(req, res) {
        const id = req.params.id;
        dbService.clearChatHistory(id);
        res.json({ success: true, message: 'Chat history cleared' });
    }
}
