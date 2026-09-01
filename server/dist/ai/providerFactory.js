import { GeminiProvider } from './geminiProvider.js';
import { FallbackProvider } from './fallbackProvider.js';
import { config } from '../config.js';
export class AIProviderFactory {
    static instance = null;
    static getProvider() {
        if (this.instance)
            return this.instance;
        if (config.geminiApiKey) {
            console.log('⚡ Initializing Google Gemini AI Provider');
            this.instance = new GeminiProvider(config.geminiApiKey);
        }
        else {
            console.log('⚡ Initializing Domain-Aware Heuristic Intelligence Provider (No API key supplied)');
            this.instance = new FallbackProvider();
        }
        return this.instance;
    }
    static setApiKey(apiKey) {
        if (apiKey && apiKey.trim()) {
            config.geminiApiKey = apiKey.trim();
            this.instance = new GeminiProvider(apiKey.trim());
            console.log('⚡ Updated Google Gemini AI Provider with new API key');
        }
        else {
            config.geminiApiKey = '';
            this.instance = new FallbackProvider();
            console.log('⚡ Switched to Domain-Aware Heuristic Provider');
        }
    }
    static getProviderStatus() {
        return {
            provider: config.geminiApiKey ? 'Google Gemini 2.5 Flash' : 'Domain-Aware Heuristic Engine',
            hasKey: Boolean(config.geminiApiKey),
        };
    }
}
