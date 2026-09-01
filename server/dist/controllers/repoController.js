import path from 'path';
import fs from 'fs';
import { dbService } from '../services/dbService.js';
import { DEMO_FILES } from '../services/demoDataService.js';
import { config } from '../config.js';
export class RepoController {
    static getRepo(req, res) {
        const id = req.params.id;
        const repo = dbService.getRepo(id);
        if (!repo) {
            res.status(404).json({ success: false, error: 'Repository analysis not found' });
            return;
        }
        res.json({ success: true, data: repo });
    }
    static getAllRepos(req, res) {
        const repos = dbService.getAllRepos();
        res.json({ success: true, data: repos });
    }
    static deleteRepo(req, res) {
        const id = req.params.id;
        const deleted = dbService.deleteRepo(id);
        if (!deleted) {
            res.status(404).json({ success: false, error: 'Repository not found' });
            return;
        }
        // Clean directory
        const repoDir = path.join(config.reposDir, id);
        if (fs.existsSync(repoDir)) {
            fs.rmSync(repoDir, { recursive: true, force: true });
        }
        res.json({ success: true, message: 'Repository removed successfully' });
    }
    static async getFileContent(req, res) {
        const id = req.params.id;
        const filePath = req.query.path;
        const queryRepoName = req.query.repoName;
        if (!filePath) {
            res.status(400).json({ success: false, error: 'File path query parameter is required' });
            return;
        }
        const repo = dbService.getRepo(id);
        // If repo not in DB (serverless stateless) but repoName provided in query, go straight to GitHub
        if (!repo && queryRepoName && queryRepoName.includes('/')) {
            const branches = ['main', 'master', 'develop'];
            for (const branch of branches) {
                const rawUrl = `https://raw.githubusercontent.com/${queryRepoName}/${branch}/${filePath}`;
                try {
                    const ghRes = await fetch(rawUrl, { headers: { 'User-Agent': 'CodeLens-AI' } });
                    if (ghRes.ok) {
                        const content = await ghRes.text();
                        res.json({
                            success: true,
                            data: {
                                path: filePath,
                                content,
                                lines: content.split('\n').length,
                                language: path.extname(filePath).replace('.', '') || 'text',
                            },
                        });
                        return;
                    }
                }
                catch { /* try next branch */ }
            }
            res.status(404).json({ success: false, error: 'File not found on GitHub' });
            return;
        }
        if (!repo) {
            res.status(404).json({ success: false, error: 'Repository not found' });
            return;
        }
        // Check if demo repo
        if (repo.source === 'demo' || id.startsWith('demo-')) {
            const demoContent = DEMO_FILES[filePath];
            if (demoContent) {
                res.json({
                    success: true,
                    data: {
                        path: filePath,
                        content: demoContent,
                        lines: demoContent.split('\n').length,
                        language: path.extname(filePath).replace('.', '') || 'text',
                    },
                });
                return;
            }
            res.json({
                success: true,
                data: {
                    path: filePath,
                    content: `// Source file: ${filePath}\n// Part of ${repo.name}\n\nexport const moduleData = {\n  loaded: true,\n  timestamp: new Date().toISOString()\n};\n`,
                    lines: 6,
                    language: path.extname(filePath).replace('.', '') || 'text',
                },
            });
            return;
        }
        // 1. Try reading from disk (works locally)
        const repoDir = path.join(config.reposDir, id);
        const normalizedRepoDir = path.normalize(repoDir);
        const resolvedPath = path.resolve(repoDir, filePath);
        if (!resolvedPath.startsWith(normalizedRepoDir)) {
            res.status(403).json({ success: false, error: 'Access denied: Invalid path' });
            return;
        }
        if (fs.existsSync(resolvedPath)) {
            try {
                const content = fs.readFileSync(resolvedPath, 'utf-8');
                res.json({
                    success: true,
                    data: {
                        path: filePath,
                        content,
                        lines: content.split('\n').length,
                        language: path.extname(filePath).replace('.', '') || 'text',
                    },
                });
                return;
            }
            catch {
                // Fall through to remote fetch
            }
        }
        // 2. Disk file not found (serverless ephemeral /tmp) — fetch from GitHub raw content API
        const repoName = repo.name; // e.g. "Pranav00076/skipsense"
        if (repoName && repoName.includes('/')) {
            const branches = ['main', 'master', 'develop'];
            for (const branch of branches) {
                const rawUrl = `https://raw.githubusercontent.com/${repoName}/${branch}/${filePath}`;
                try {
                    const ghRes = await fetch(rawUrl, {
                        headers: { 'User-Agent': 'CodeLens-AI' },
                    });
                    if (ghRes.ok) {
                        const content = await ghRes.text();
                        res.json({
                            success: true,
                            data: {
                                path: filePath,
                                content,
                                lines: content.split('\n').length,
                                language: path.extname(filePath).replace('.', '') || 'text',
                            },
                        });
                        return;
                    }
                }
                catch {
                    // Try next branch
                }
            }
        }
        res.status(404).json({ success: false, error: 'File not found' });
    }
    static exportOnboardingMarkdown(req, res) {
        const id = req.params.id;
        const repo = dbService.getRepo(id);
        if (!repo) {
            res.status(404).json({ success: false, error: 'Repository not found' });
            return;
        }
        const g = repo.onboardingGuide;
        const md = `# 🚀 Onboarding Guide: ${repo.name}
Generated by **CodeLens AI** on ${new Date(repo.analyzedAt).toLocaleDateString()}

---

## 🎯 1. Project Mission & Overview
${g.mission}

- **Primary Languages**: ${repo.languages.map(l => `${l.name} (${l.percentage}%)`).join(', ')}
- **Frameworks & Tools**: ${repo.frameworks.map(f => f.name).join(', ')}
- **Architecture Pattern**: ${repo.architecture.pattern}

---

## ⚡ 2. Local Setup & Quick Start

### Prerequisites
${g.quickStart.prerequisites.map(p => `- [ ] ${p}`).join('\n')}

### Environment Variables
| Variable | Required | Example | Description |
| :--- | :--- | :--- | :--- |
${g.quickStart.envVars.map(e => `| \`${e.key}\` | ${e.required ? '✅ Yes' : 'No'} | \`${e.example}\` | ${e.description} |`).join('\n')}

### Step-by-Step Commands
${g.quickStart.commands.map((c, i) => `#### ${c.label}
\`\`\`bash
${c.command}
\`\`\`
*${c.description}*
`).join('\n')}

---

## 🏛️ 3. Architecture & Data Flow
${g.architectureWalkthrough}

${repo.architecture.dataFlow}

---

## 📂 4. Essential Files to Read First
${g.starterFiles.map(s => `### ${s.rank}. \`${s.path}\`
${s.reasonToRead}
- **Key Concepts**: ${s.keyConcepts.join(', ')}
`).join('\n')}

---

## 🔄 5. Application Execution Flow
${g.executionFlow.map(e => `### Step ${e.step}: ${e.title}
- **Trigger**: ${e.trigger}
- **Code Trace**: ${e.trace.map(t => `\`${t}\``).join(' ➔ ')}
- **Details**: ${e.description}
`).join('\n')}

---

## 🗺️ 6. Recommended 7-Day Learning Path
${g.learningPath.map(l => `### 📅 ${l.day} — ${l.milestone}
**Key Tasks:**
${l.tasks.map(t => `- [ ] ${t}`).join('\n')}
**Files to Explore:**
${l.filesToExplore.map(f => `- \`${f}\``).join('\n')}
`).join('\n')}

---
*Generated with ❤️ by CodeLens AI*
`;
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="ONBOARDING-${repo.name.replace(/[/\\?%*:|"<>]/g, '-')}.md"`);
        res.send(md);
    }
}
