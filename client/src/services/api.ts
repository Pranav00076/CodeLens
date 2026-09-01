import { RepoAnalysis, ChatMessage, GeneratedTest } from '../types/index';

const API_BASE = '/api';

export const api = {
  async getHealth(): Promise<{ status: string; aiProvider: string; isAIAvailable: boolean }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  async getConfigStatus(): Promise<{ provider: string; hasKey: boolean }> {
    const res = await fetch(`${API_BASE}/config/status`);
    const json = await res.json();
    return json.data;
  },

  async setApiKey(apiKey: string): Promise<{ provider: string; hasKey: boolean }> {
    const res = await fetch(`${API_BASE}/config/apikey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    const json = await res.json();
    return json.data;
  },

  async getDemo(): Promise<RepoAnalysis> {
    const res = await fetch(`${API_BASE}/analyze/demo`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load demo repository');
    return json.data;
  },

  async analyzeGithub(url: string): Promise<RepoAnalysis> {
    const res = await fetch(`${API_BASE}/analyze/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to analyze GitHub repository');
    return json.data;
  },

  async analyzeZip(file: File): Promise<RepoAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/analyze/upload`, {
      method: 'POST',
      body: formData,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to analyze ZIP archive');
    return json.data;
  },

  async getRepo(id: string): Promise<RepoAnalysis> {
    const res = await fetch(`${API_BASE}/repos/${id}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch repository');
    return json.data;
  },

  async getAllRepos(): Promise<Array<{ id: string; name: string; source: string; analyzedAt: string; stats: any; summary: string }>> {
    const res = await fetch(`${API_BASE}/repos`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch repositories');
    return json.data;
  },

  async getFileContent(repoId: string, path: string): Promise<{ path: string; content: string; lines: number; language: string }> {
    const res = await fetch(`${API_BASE}/repos/${repoId}/file?path=${encodeURIComponent(path)}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch file content');
    return json.data;
  },

  getExportOnboardingUrl(repoId: string): string {
    return `${API_BASE}/repos/${repoId}/export/onboarding`;
  },

  async askQuestion(repoId: string, question: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/repos/${repoId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate answer');
    return json.data;
  },

  async getChatHistory(repoId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/repos/${repoId}/chat`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to get chat history');
    return json.data;
  },

  async clearChatHistory(repoId: string): Promise<void> {
    await fetch(`${API_BASE}/repos/${repoId}/chat`, { method: 'DELETE' });
  },

  async generateTests(repoId: string, targetFile: string, targetFunction?: string, framework: string = 'Vitest'): Promise<GeneratedTest> {
    const res = await fetch(`${API_BASE}/repos/${repoId}/tests/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetFile, targetFunction, framework }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to generate test cases');
    return json.data;
  },

  async getSavedTests(repoId: string): Promise<GeneratedTest[]> {
    const res = await fetch(`${API_BASE}/repos/${repoId}/tests`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to fetch tests');
    return json.data;
  },
};
