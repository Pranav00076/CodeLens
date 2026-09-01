import fs from 'fs';
import path from 'path';
import { config } from '../config.js';
class DatabaseService {
    dbPath;
    data;
    constructor() {
        this.dbPath = path.join(config.dataDir, 'codelens_db.json');
        this.data = { repos: {}, chats: {}, tests: {} };
        this.init();
    }
    init() {
        try {
            if (fs.existsSync(this.dbPath)) {
                const raw = fs.readFileSync(this.dbPath, 'utf-8');
                this.data = JSON.parse(raw);
                if (!this.data.repos)
                    this.data.repos = {};
                if (!this.data.chats)
                    this.data.chats = {};
                if (!this.data.tests)
                    this.data.tests = {};
            }
            else {
                this.save();
            }
        }
        catch (err) {
            console.warn('Database initialization note (using in-memory store):', err);
            this.data = { repos: {}, chats: {}, tests: {} };
        }
    }
    save() {
        try {
            const dir = path.dirname(this.dbPath);
            if (!fs.existsSync(dir))
                fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
        }
        catch (err) {
            // In serverless / read-only filesystem, in-memory state is maintained
        }
    }
    saveRepo(repo) {
        this.data.repos[repo.id] = repo;
        if (!this.data.chats[repo.id]) {
            this.data.chats[repo.id] = [];
        }
        if (!this.data.tests[repo.id]) {
            this.data.tests[repo.id] = [];
        }
        this.save();
    }
    getRepo(id) {
        return this.data.repos[id] || null;
    }
    getAllRepos() {
        return Object.values(this.data.repos).map(r => ({
            id: r.id,
            name: r.name,
            source: r.source,
            analyzedAt: r.analyzedAt,
            stats: r.stats,
            summary: r.summary,
        })).sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
    }
    deleteRepo(id) {
        if (this.data.repos[id]) {
            delete this.data.repos[id];
            delete this.data.chats[id];
            delete this.data.tests[id];
            this.save();
            return true;
        }
        return false;
    }
    getChatHistory(repoId) {
        return this.data.chats[repoId] || [];
    }
    addChatMessage(repoId, message) {
        if (!this.data.chats[repoId]) {
            this.data.chats[repoId] = [];
        }
        this.data.chats[repoId].push(message);
        this.save();
    }
    clearChatHistory(repoId) {
        this.data.chats[repoId] = [];
        this.save();
    }
    getTests(repoId) {
        return this.data.tests[repoId] || [];
    }
    addTest(repoId, test) {
        if (!this.data.tests[repoId]) {
            this.data.tests[repoId] = [];
        }
        this.data.tests[repoId].unshift(test);
        this.save();
    }
}
export const dbService = new DatabaseService();
