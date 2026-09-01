import { PromptTemplates } from './prompts.js';
import { FallbackProvider } from './fallbackProvider.js';
import { v4 as uuidv4 } from 'uuid';
export class GeminiProvider {
    name = 'Google Gemini 2.5 Flash';
    apiKey;
    fallback;
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.fallback = new FallbackProvider();
    }
    isAvailable() {
        return Boolean(this.apiKey && this.apiKey.trim().length > 0);
    }
    cleanJson(text) {
        let clean = text.trim();
        if (clean.startsWith('```json')) {
            clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }
        else if (clean.startsWith('```')) {
            clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        return clean;
    }
    async analyzeCodebase(context) {
        if (!this.isAvailable()) {
            return this.fallback.analyzeCodebase(context);
        }
        try {
            const prompt = PromptTemplates.buildAnalysisPrompt(context);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json',
                    }
                }),
            });
            if (!response.ok) {
                console.warn(`Gemini API error: ${response.statusText}. Using intelligent fallback.`);
                return this.fallback.analyzeCodebase(context);
            }
            const data = (await response.json());
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText)
                return this.fallback.analyzeCodebase(context);
            const parsed = JSON.parse(this.cleanJson(rawText));
            return {
                summary: parsed.summary || 'Codebase analysis complete.',
                architecture: parsed.architecture || (await this.fallback.analyzeCodebase(context)).architecture,
                issues: parsed.issues || [],
                onboardingGuide: parsed.onboardingGuide || (await this.fallback.analyzeCodebase(context)).onboardingGuide,
            };
        }
        catch (err) {
            console.error('Gemini analyze failed, falling back:', err);
            return this.fallback.analyzeCodebase(context);
        }
    }
    async answerQuestion(context, history, question) {
        if (!this.isAvailable()) {
            return this.fallback.answerQuestion(context, history, question);
        }
        try {
            const prompt = PromptTemplates.buildChatPrompt(context, history, question);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.3 }
                }),
            });
            if (!response.ok) {
                return this.fallback.answerQuestion(context, history, question);
            }
            const data = (await response.json());
            const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            // Extract file citations from answer
            const citations = [];
            const citationMatches = answer.matchAll(/\[([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)(?::L?(\d+))?\]/g);
            for (const m of citationMatches) {
                const filePath = m[1];
                const line = m[2] ? parseInt(m[2], 10) : 1;
                if (!citations.some(c => c.filePath === filePath)) {
                    citations.push({ filePath, line, label: filePath });
                }
            }
            return { answer, citations };
        }
        catch (err) {
            console.error('Gemini chat failed, falling back:', err);
            return this.fallback.answerQuestion(context, history, question);
        }
    }
    async generateTests(context, targetFile, fileContent, targetFunction, framework = 'Vitest') {
        if (!this.isAvailable()) {
            return this.fallback.generateTests(context, targetFile, fileContent, targetFunction, framework);
        }
        try {
            const prompt = PromptTemplates.buildTestGenerationPrompt(context, targetFile, fileContent, targetFunction, framework);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json',
                    }
                }),
            });
            if (!response.ok) {
                return this.fallback.generateTests(context, targetFile, fileContent, targetFunction, framework);
            }
            const data = (await response.json());
            const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!rawText)
                return this.fallback.generateTests(context, targetFile, fileContent, targetFunction, framework);
            const parsed = JSON.parse(this.cleanJson(rawText));
            return {
                id: `test-${uuidv4().slice(0, 8)}`,
                targetFile,
                targetFunction: targetFunction || parsed.targetFunction || 'all',
                framework: framework || parsed.framework || 'Vitest',
                rationale: parsed.rationale || 'Automated test suite generated by Gemini',
                edgeCases: parsed.edgeCases || [],
                expectedOutputs: parsed.expectedOutputs || [],
                code: parsed.code || '// Test code generation completed',
            };
        }
        catch (err) {
            console.error('Gemini test generation failed, falling back:', err);
            return this.fallback.generateTests(context, targetFile, fileContent, targetFunction, framework);
        }
    }
}
