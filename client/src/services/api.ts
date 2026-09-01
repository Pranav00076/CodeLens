import { RepoAnalysis, ChatMessage, GeneratedTest } from '../types/index';

const API_BASE = '/api';

async function parseResponse<T = any>(res: Response): Promise<T> {
  const text = await res.text();
  let json: any = null;

  try {
    json = JSON.parse(text);
  } catch {
    // If not JSON, check if it's an error message
    if (!res.ok) {
      throw new Error(`Server returned error (${res.status}): ${text.slice(0, 150)}`);
    }
  }

  if (!res.ok) {
    throw new Error(json?.error || `Request failed with status ${res.status}`);
  }

  if (json && typeof json.success === 'boolean' && !json.success) {
    throw new Error(json.error || 'Server operation failed');
  }

  return (json?.data !== undefined ? json.data : json) as T;
}

export const api = {
  async getHealth(): Promise<{ status: string; aiProvider: string; isAIAvailable: boolean }> {
    const res = await fetch(`${API_BASE}/health`);
    return parseResponse(res);
  },

  async getConfigStatus(): Promise<{ provider: string; hasKey: boolean }> {
    const res = await fetch(`${API_BASE}/config/status`);
    return parseResponse(res);
  },

  async setApiKey(apiKey: string): Promise<{ provider: string; hasKey: boolean }> {
    const res = await fetch(`${API_BASE}/config/apikey`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey }),
    });
    return parseResponse(res);
  },

  async getDemo(): Promise<RepoAnalysis> {
    const res = await fetch(`${API_BASE}/analyze/demo`);
    return parseResponse(res);
  },

  async analyzeGithub(url: string): Promise<RepoAnalysis> {
    const res = await fetch(`${API_BASE}/analyze/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    return parseResponse(res);
  },

  async analyzeZip(file: File): Promise<RepoAnalysis> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/analyze/upload`, {
      method: 'POST',
      body: formData,
    });
    return parseResponse(res);
  },

  async getRepo(id: string): Promise<RepoAnalysis> {
    const res = await fetch(`${API_BASE}/repos/${id}`);
    return parseResponse(res);
  },

  async getAllRepos(): Promise<Array<{ id: string; name: string; source: string; analyzedAt: string; stats: any; summary: string }>> {
    const res = await fetch(`${API_BASE}/repos`);
    return parseResponse(res);
  },

  async getFileContent(repoId: string, filePath: string, repoName?: string): Promise<{ path: string; content: string; lines: number; language: string }> {
    const params = new URLSearchParams({ path: filePath });
    if (repoName) params.set('repoName', repoName);
    const res = await fetch(`${API_BASE}/repos/${repoId}/file?${params.toString()}`);
    return parseResponse(res);
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
    return parseResponse(res);
  },

  async getChatHistory(repoId: string): Promise<ChatMessage[]> {
    const res = await fetch(`${API_BASE}/repos/${repoId}/chat`);
    return parseResponse(res);
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
    return parseResponse(res);
  },

  async getSavedTests(repoId: string): Promise<GeneratedTest[]> {
    const res = await fetch(`${API_BASE}/repos/${repoId}/tests`);
    return parseResponse(res);
  },
};
