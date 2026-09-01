import fs from 'fs';
import path from 'path';
import { RepoAnalysis, ChatMessage, GeneratedTest } from '../types/index.js';
import { config } from '../config.js';

interface DatabaseSchema {
  repos: Record<string, RepoAnalysis>;
  chats: Record<string, ChatMessage[]>;
  tests: Record<string, GeneratedTest[]>;
}

class DatabaseService {
  private dbPath: string;
  private data: DatabaseSchema;

  constructor() {
    this.dbPath = path.join(config.dataDir, 'codelens_db.json');
    this.data = { repos: {}, chats: {}, tests: {} };
    this.init();
  }

  private init() {
    try {
      if (fs.existsSync(this.dbPath)) {
        const raw = fs.readFileSync(this.dbPath, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.repos) this.data.repos = {};
        if (!this.data.chats) this.data.chats = {};
        if (!this.data.tests) this.data.tests = {};
      } else {
        this.save();
      }
    } catch (err) {
      console.warn('Database initialization note (using in-memory store):', err);
      this.data = { repos: {}, chats: {}, tests: {} };
    }
  }

  private save() {
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      // In serverless / read-only filesystem, in-memory state is maintained
    }
  }

  public saveRepo(repo: RepoAnalysis): void {
    this.data.repos[repo.id] = repo;
    if (!this.data.chats[repo.id]) {
      this.data.chats[repo.id] = [];
    }
    if (!this.data.tests[repo.id]) {
      this.data.tests[repo.id] = [];
    }
    this.save();
  }

  public getRepo(id: string): RepoAnalysis | null {
    return this.data.repos[id] || null;
  }

  public getAllRepos(): Array<{ id: string; name: string; source: string; analyzedAt: string; stats: any; summary: string }> {
    return Object.values(this.data.repos).map(r => ({
      id: r.id,
      name: r.name,
      source: r.source,
      analyzedAt: r.analyzedAt,
      stats: r.stats,
      summary: r.summary,
    })).sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
  }

  public deleteRepo(id: string): boolean {
    if (this.data.repos[id]) {
      delete this.data.repos[id];
      delete this.data.chats[id];
      delete this.data.tests[id];
      this.save();
      return true;
    }
    return false;
  }

  public getChatHistory(repoId: string): ChatMessage[] {
    return this.data.chats[repoId] || [];
  }

  public addChatMessage(repoId: string, message: ChatMessage): void {
    if (!this.data.chats[repoId]) {
      this.data.chats[repoId] = [];
    }
    this.data.chats[repoId].push(message);
    this.save();
  }

  public clearChatHistory(repoId: string): void {
    this.data.chats[repoId] = [];
    this.save();
  }

  public getTests(repoId: string): GeneratedTest[] {
    return this.data.tests[repoId] || [];
  }

  public addTest(repoId: string, test: GeneratedTest): void {
    if (!this.data.tests[repoId]) {
      this.data.tests[repoId] = [];
    }
    this.data.tests[repoId].unshift(test);
    this.save();
  }
}

export const dbService = new DatabaseService();
