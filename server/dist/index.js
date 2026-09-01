import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import analyzeRouter from './routes/analyze.js';
import reposRouter from './routes/repos.js';
import chatRouter from './routes/chat.js';
import testsRouter from './routes/tests.js';
import { AIProviderFactory } from './ai/providerFactory.js';
const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// Health & System Info
app.get('/api/health', (req, res) => {
    const provider = AIProviderFactory.getProvider();
    res.json({
        status: 'ok',
        version: '1.0.0',
        aiProvider: provider.name,
        isAIAvailable: provider.isAvailable(),
        timestamp: new Date().toISOString(),
    });
});
// Dynamic AI API Key Configuration
app.get('/api/config/status', (req, res) => {
    res.json({
        success: true,
        data: AIProviderFactory.getProviderStatus(),
    });
});
app.post('/api/config/apikey', (req, res) => {
    const { apiKey } = req.body;
    AIProviderFactory.setApiKey(apiKey || '');
    res.json({
        success: true,
        data: AIProviderFactory.getProviderStatus(),
        message: apiKey ? 'Google Gemini API key configured successfully' : 'Reset to Domain-Aware Heuristic Provider',
    });
});
// Mount Routes
app.use('/api/analyze', analyzeRouter);
app.use('/api/repos', reposRouter);
app.use('/api/repos/:id/chat', chatRouter);
app.use('/api/repos/:id/tests', testsRouter);
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal server error',
    });
});
// Only listen locally, Vercel exports app directly as a serverless function
if (process.env.VERCEL !== '1') {
    app.listen(config.port, () => {
        console.log(`\n==============================================`);
        console.log(`🚀 CodeLens AI Server running on port ${config.port}`);
        console.log(`🧠 AI Provider: ${AIProviderFactory.getProvider().name}`);
        console.log(`📁 Data Directory: ${config.dataDir}`);
        console.log(`==============================================\n`);
    });
}
export default app;
