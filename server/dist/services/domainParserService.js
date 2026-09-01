import fs from 'fs';
import path from 'path';
export class DomainParserService {
    /**
     * Deeply extracts domain knowledge from README, manifests, and file hierarchy
     */
    static extractDomainMetadata(rootDir, scannedFiles) {
        // 1. Locate and parse README
        const readmeFile = scannedFiles.find(f => /(?:^|\/)(readme|read_me|readme\.md|readme\.markdown|readme\.txt|readme\.rst)$/i.test(f.relativePath));
        let readmeContent = '';
        if (readmeFile && fs.existsSync(readmeFile.absolutePath)) {
            try {
                readmeContent = fs.readFileSync(readmeFile.absolutePath, 'utf-8');
            }
            catch {
                readmeContent = readmeFile.sampleContent || '';
            }
        }
        const readmeParsed = this.parseReadme(readmeContent);
        // 2. Locate and parse manifest (package.json, manifest.json, pyproject.toml, Cargo.toml)
        const manifestInfo = this.parseManifests(rootDir, scannedFiles);
        // 3. Identify core domain modules
        const identifiedModules = this.identifyKeyModules(scannedFiles);
        return {
            readmeContent,
            readmeTitle: readmeParsed.title,
            readmeTagline: readmeParsed.tagline,
            readmeOverview: readmeParsed.overview,
            readmeProblemStatement: readmeParsed.problemStatement,
            readmeFeatures: readmeParsed.features,
            readmePrerequisites: readmeParsed.prerequisites,
            readmeCommands: readmeParsed.commands,
            manifestInfo,
            identifiedModules,
        };
    }
    static parseReadme(content) {
        if (!content || !content.trim()) {
            return {
                title: '',
                tagline: '',
                overview: '',
                problemStatement: '',
                features: [],
                prerequisites: [],
                commands: [],
            };
        }
        const lines = content.split('\n');
        let title = '';
        let tagline = '';
        let overview = '';
        let problemStatement = '';
        const features = [];
        const prerequisites = [];
        const commands = [];
        // Find first # Title
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('# ') && !title) {
                title = line.replace(/^#\s+/, '').replace(/<[^>]*>/g, '').replace(/[#*`_]/g, '').trim();
                // Check if next non-empty lines are tagline / blockquote
                for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
                    const next = lines[j].trim();
                    if (next.startsWith('>') || (next.length > 10 && !next.startsWith('#') && !next.startsWith('[') && !next.startsWith('<div') && !next.startsWith('<!'))) {
                        const cleanTagline = next.replace(/<[^>]*>/g, '').replace(/^[>\s*-]+/, '').replace(/[*_`]/g, '').trim();
                        if (cleanTagline.length > 12 && !cleanTagline.includes('badge') && !cleanTagline.includes('img.shields') && !cleanTagline.includes('align=')) {
                            tagline = cleanTagline;
                            break;
                        }
                    }
                }
                break;
            }
        }
        // Extract sections
        let currentSection = '';
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('## ') || line.startsWith('### ')) {
                currentSection = line.replace(/^[#\s]+/, '').toLowerCase();
                continue;
            }
            // Feature bullet points
            if ((currentSection.includes('feature') || currentSection.includes('what it does') || currentSection.includes('highlights') || currentSection.includes('capabilities')) &&
                (line.startsWith('- ') || line.startsWith('* '))) {
                const featText = line.replace(/^[-*]\s+/, '').replace(/[*_`]/g, '').trim();
                if (featText.length > 8 && !featText.startsWith('http') && !featText.includes('shields.io')) {
                    features.push(featText);
                }
            }
            // Overview / About / Mission
            if ((currentSection.includes('overview') || currentSection.includes('about') || currentSection.includes('introduction') || currentSection.includes('what is') || currentSection.includes('mission')) &&
                !overview &&
                line.length > 20 &&
                !line.startsWith('#') &&
                !line.startsWith('```') &&
                !line.startsWith('![') &&
                !line.startsWith('<')) {
                overview = line.replace(/<[^>]*>/g, '').replace(/[*_`]/g, '').trim();
            }
            // Problem statement
            if ((currentSection.includes('problem') || currentSection.includes('why') || currentSection.includes('motivation') || currentSection.includes('goal')) &&
                !problemStatement &&
                line.length > 20 &&
                !line.startsWith('#') &&
                !line.startsWith('<')) {
                problemStatement = line.replace(/<[^>]*>/g, '').replace(/[*_`]/g, '').trim();
            }
            // Prerequisites
            if (currentSection.includes('prerequisite') && (line.startsWith('- ') || line.startsWith('* '))) {
                const prereq = line.replace(/^[-*]\s+/, '').replace(/[*_`]/g, '').trim();
                if (prereq.length > 3)
                    prerequisites.push(prereq);
            }
            // Commands in code blocks under Installation or Getting Started
            if ((currentSection.includes('install') || currentSection.includes('getting started') || currentSection.includes('setup') || currentSection.includes('run') || currentSection.includes('develop')) &&
                line.startsWith('```')) {
                const codeLines = [];
                let k = i + 1;
                while (k < lines.length && !lines[k].trim().startsWith('```')) {
                    const cLine = lines[k].trim();
                    if (cLine && !cLine.startsWith('#')) {
                        codeLines.push(cLine);
                    }
                    k++;
                }
                if (codeLines.length > 0) {
                    const cmdStr = codeLines.join(' && ');
                    if (cmdStr.includes('npm') || cmdStr.includes('yarn') || cmdStr.includes('pnpm') || cmdStr.includes('cargo') || cmdStr.includes('python') || cmdStr.includes('pip') || cmdStr.includes('go ') || cmdStr.includes('git clone') || cmdStr.includes('docker')) {
                        commands.push({
                            label: `Run setup step`,
                            command: cmdStr,
                            description: `Configures and builds repository components`,
                        });
                    }
                }
            }
        }
        return {
            title,
            tagline,
            overview: overview || tagline,
            problemStatement: problemStatement || overview || tagline,
            features: features.slice(0, 8),
            prerequisites: prerequisites.slice(0, 5),
            commands: commands.slice(0, 4),
        };
    }
    static parseManifests(rootDir, scannedFiles) {
        const manifestInfo = {
            projectType: 'general_app',
            keywords: [],
            scripts: {},
            dependencies: [],
        };
        // Check Chrome Extension manifest.json
        const chromeManifest = scannedFiles.find(f => /(?:^|\/)manifest\.json$/i.test(f.relativePath));
        if (chromeManifest && fs.existsSync(chromeManifest.absolutePath)) {
            try {
                const m = JSON.parse(fs.readFileSync(chromeManifest.absolutePath, 'utf-8'));
                if (m.manifest_version || m.permissions || m.action || m.background || m.content_scripts) {
                    manifestInfo.projectType = 'chrome_extension';
                    manifestInfo.name = m.name || manifestInfo.name;
                    manifestInfo.description = m.description || manifestInfo.description;
                    manifestInfo.version = m.version;
                    return manifestInfo;
                }
            }
            catch {
                // ignore
            }
        }
        // Check package.json
        const rootPkg = scannedFiles.find(f => f.relativePath === 'package.json' || f.relativePath.endsWith('/package.json'));
        if (rootPkg && fs.existsSync(rootPkg.absolutePath)) {
            try {
                const p = JSON.parse(fs.readFileSync(rootPkg.absolutePath, 'utf-8'));
                manifestInfo.name = p.name || manifestInfo.name;
                manifestInfo.description = p.description || manifestInfo.description;
                manifestInfo.version = p.version;
                manifestInfo.keywords = Array.isArray(p.keywords) ? p.keywords : [];
                manifestInfo.scripts = p.scripts || {};
                manifestInfo.dependencies = Object.keys({ ...p.dependencies, ...p.devDependencies });
                if (manifestInfo.dependencies.includes('react') || manifestInfo.dependencies.includes('vue') || manifestInfo.dependencies.includes('next')) {
                    manifestInfo.projectType = 'fullstack_web';
                }
                else if (manifestInfo.dependencies.includes('express') || manifestInfo.dependencies.includes('fastify') || manifestInfo.dependencies.includes('@nestjs/core')) {
                    manifestInfo.projectType = 'backend_api';
                }
            }
            catch {
                // ignore
            }
        }
        // Check pyproject.toml / setup.py
        const pyproject = scannedFiles.find(f => f.relativePath.endsWith('pyproject.toml') || f.relativePath.endsWith('setup.py'));
        if (pyproject && fs.existsSync(pyproject.absolutePath)) {
            try {
                const content = fs.readFileSync(pyproject.absolutePath, 'utf-8');
                const descMatch = content.match(/description\s*=\s*["']([^"']+)["']/i);
                if (descMatch)
                    manifestInfo.description = descMatch[1];
                manifestInfo.projectType = 'backend_api';
            }
            catch {
                // ignore
            }
        }
        return manifestInfo;
    }
    static identifyKeyModules(scannedFiles) {
        const modules = [];
        for (const f of scannedFiles) {
            const p = f.relativePath.toLowerCase();
            if (p.includes('infer') || p.includes('facedetect') || p.includes('classifier') || p.includes('model') || p.includes('ai/')) {
                modules.push({ name: path.basename(f.relativePath), path: f.relativePath, purpose: 'AI inference pipeline & computer vision models' });
            }
            else if (p.includes('state') || p.includes('statemachine') || p.includes('decision') || p.includes('fsm')) {
                modules.push({ name: path.basename(f.relativePath), path: f.relativePath, purpose: 'Finite State Machine & decision logic' });
            }
            else if (p.includes('site') || p.includes('adapter')) {
                modules.push({ name: path.basename(f.relativePath), path: f.relativePath, purpose: 'Site adapter & DOM mutation observer' });
            }
            else if (p.includes('auth') || p.includes('jwt') || p.includes('session')) {
                modules.push({ name: path.basename(f.relativePath), path: f.relativePath, purpose: 'Authentication, token verification & security guards' });
            }
            else if (p.includes('order') || p.includes('payment') || p.includes('checkout') || p.includes('stripe')) {
                modules.push({ name: path.basename(f.relativePath), path: f.relativePath, purpose: 'Order lifecycle, billing & transactions' });
            }
            else if (p.includes('schema') || p.includes('model') || p.includes('database') || p.includes('prisma')) {
                modules.push({ name: path.basename(f.relativePath), path: f.relativePath, purpose: 'Data models & persistence schemas' });
            }
        }
        return modules.slice(0, 10);
    }
}
