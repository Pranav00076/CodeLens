import fs from 'fs';
import path from 'path';
import { FileTreeNode, TechLanguage, TechFramework, EntryPoint, RepoStats } from '../types/index.js';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.github', '.svn', '.hg', '.next', '.nuxt',
  'dist', 'build', 'out', 'coverage', '.cache', '.turbo', 'venv',
  '.venv', 'env', '__pycache__', 'target', 'bin', 'obj', '.idea',
  '.vscode', 'vendor', 'tmp', 'temp', '.serverless'
]);

const IGNORED_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'Cargo.lock',
  'composer.lock', 'poetry.lock', 'Gemfile.lock', 'go.sum',
  '.DS_Store', 'Thumbs.db', '.env', '.env.local'
]);

const IGNORED_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp', '.pdf',
  '.mp4', '.mp3', '.mov', '.avi', '.woff', '.woff2', '.ttf', '.eot',
  '.zip', '.tar', '.gz', '.7z', '.rar', '.exe', '.dll', '.so', '.dylib',
  '.class', '.pyc', '.pyo', '.o', '.a', '.map', '.min.js', '.min.css'
]);

const LANGUAGE_MAP: Record<string, { name: string; color: string }> = {
  '.ts': { name: 'TypeScript', color: '#3178C6' },
  '.tsx': { name: 'TypeScript (React)', color: '#3178C6' },
  '.js': { name: 'JavaScript', color: '#F7DF1E' },
  '.jsx': { name: 'JavaScript (React)', color: '#F7DF1E' },
  '.mjs': { name: 'JavaScript', color: '#F7DF1E' },
  '.py': { name: 'Python', color: '#3776AB' },
  '.go': { name: 'Go', color: '#00ADD8' },
  '.rs': { name: 'Rust', color: '#DEA584' },
  '.java': { name: 'Java', color: '#B07219' },
  '.c': { name: 'C', color: '#555555' },
  '.cpp': { name: 'C++', color: '#F34B7D' },
  '.cs': { name: 'C#', color: '#178600' },
  '.rb': { name: 'Ruby', color: '#701516' },
  '.php': { name: 'PHP', color: '#4F5D95' },
  '.swift': { name: 'Swift', color: '#F05138' },
  '.kt': { name: 'Kotlin', color: '#A97BFF' },
  '.sql': { name: 'SQL', color: '#E38C00' },
  '.html': { name: 'HTML', color: '#E34F26' },
  '.css': { name: 'CSS', color: '#563D7C' },
  '.scss': { name: 'SCSS', color: '#C6538C' },
  '.vue': { name: 'Vue', color: '#41B883' },
  '.svelte': { name: 'Svelte', color: '#FF3E00' },
  '.json': { name: 'JSON', color: '#292929' },
  '.yaml': { name: 'YAML', color: '#CB171E' },
  '.yml': { name: 'YAML', color: '#CB171E' },
  '.toml': { name: 'TOML', color: '#9C4221' },
  '.md': { name: 'Markdown', color: '#083FA1' },
  '.sh': { name: 'Shell', color: '#89E051' },
};

export class ScannerService {
  /**
   * Scans a directory and returns comprehensive repository analysis structures
   */
  static scanDirectory(rootDir: string): {
    fileTree: FileTreeNode;
    stats: RepoStats;
    languages: TechLanguage[];
    frameworks: TechFramework[];
    entryPoints: EntryPoint[];
    allScannedFiles: Array<{ relativePath: string; absolutePath: string; lines: number; size: number; language?: string; sampleContent?: string }>;
  } {
    let totalFiles = 0;
    let totalLines = 0;
    let totalSizeKB = 0;
    const languageCounts: Record<string, { lines: number; files: number; color: string }> = {};
    const frameworkCounts: Record<string, number> = {};
    const allScannedFiles: Array<{ relativePath: string; absolutePath: string; lines: number; size: number; language?: string; sampleContent?: string }> = [];

    function traverse(currentDir: string, relativePath: string = ''): FileTreeNode {
      const dirName = path.basename(currentDir);
      const node: FileTreeNode = {
        name: dirName || 'root',
        path: relativePath || '/',
        type: 'dir',
        children: [],
      };

      let entries: string[] = [];
      try {
        entries = fs.readdirSync(currentDir);
      } catch (err) {
        return node;
      }

      // Sort dirs first, then files alphabetically
      entries.sort((a, b) => {
        const fullA = path.join(currentDir, a);
        const fullB = path.join(currentDir, b);
        const isDirA = fs.existsSync(fullA) && fs.statSync(fullA).isDirectory();
        const isDirB = fs.existsSync(fullB) && fs.statSync(fullB).isDirectory();
        if (isDirA && !isDirB) return -1;
        if (!isDirA && isDirB) return 1;
        return a.localeCompare(b);
      });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry);
        const relPath = relativePath ? `${relativePath}/${entry}` : entry;

        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch {
          continue;
        }

        if (stat.isDirectory()) {
          if (IGNORED_DIRS.has(entry) || entry.startsWith('.')) {
            continue;
          }
          const childNode = traverse(fullPath, relPath);
          node.children?.push(childNode);
        } else {
          const ext = path.extname(entry).toLowerCase();
          if (IGNORED_FILES.has(entry) || IGNORED_EXTENSIONS.has(ext)) {
            continue;
          }

          let lineCount = 0;
          let sampleContent = '';
          try {
            const content = fs.readFileSync(fullPath, 'utf-8');
            lineCount = content.split('\n').length;
            sampleContent = content.slice(0, 10000); // 10KB sample for AI analysis
          } catch {
            lineCount = 0;
          }

          const sizeKB = Math.round(stat.size / 1024);
          totalFiles++;
          totalLines += lineCount;
          totalSizeKB += sizeKB;

          const langInfo = LANGUAGE_MAP[ext] || { name: 'Other', color: '#6B7280' };
          const langName = langInfo.name;

          if (!languageCounts[langName]) {
            languageCounts[langName] = { lines: 0, files: 0, color: langInfo.color };
          }
          languageCounts[langName].lines += lineCount;
          languageCounts[langName].files += 1;

          allScannedFiles.push({
            relativePath: relPath,
            absolutePath: fullPath,
            lines: lineCount,
            size: stat.size,
            language: langName,
            sampleContent,
          });

          node.children?.push({
            name: entry,
            path: relPath,
            type: 'file',
            size: stat.size,
            lines: lineCount,
            language: langName,
          });
        }
      }

      return node;
    }

    const fileTree = traverse(rootDir, '');

    // Calculate language percentages
    const languages: TechLanguage[] = Object.entries(languageCounts)
      .map(([name, data]) => ({
        name,
        fileCount: data.files,
        percentage: totalLines > 0 ? Math.round((data.lines / totalLines) * 100) : 0,
        color: data.color,
      }))
      .filter(l => l.percentage > 0 || l.fileCount > 0)
      .sort((a, b) => b.percentage - a.percentage);

    // Detect frameworks and technologies
    const frameworks = this.detectFrameworks(rootDir, allScannedFiles);
    frameworks.forEach(f => {
      frameworkCounts[f.name] = (frameworkCounts[f.name] || 0) + 1;
    });

    // Detect entry points
    const entryPoints = this.detectEntryPoints(allScannedFiles);

    const stats: RepoStats = {
      totalFiles,
      totalLines,
      totalSizeKB,
      languageCounts: Object.fromEntries(Object.entries(languageCounts).map(([k, v]) => [k, v.files])),
      frameworkCounts,
      healthScore: 92, // Initial baseline score, adjusted by issue findings
    };

    return {
      fileTree,
      stats,
      languages,
      frameworks,
      entryPoints,
      allScannedFiles,
    };
  }

  /**
   * Detects frameworks from package.json, requirements.txt, go.mod, Cargo.toml, etc.
   */
  private static detectFrameworks(rootDir: string, scannedFiles: Array<{ relativePath: string; absolutePath: string }>): TechFramework[] {
    const frameworks: Map<string, TechFramework> = new Map();

    // Helper to check package.json
    const pkgFiles = scannedFiles.filter(f => f.relativePath.endsWith('package.json'));
    for (const pkgFile of pkgFiles) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgFile.absolutePath, 'utf-8'));
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['react']) frameworks.set('React', { name: 'React', category: 'frontend', description: 'Declarative UI Library' });
        if (deps['next']) frameworks.set('Next.js', { name: 'Next.js', category: 'frontend', description: 'Full-stack React Framework' });
        if (deps['vue']) frameworks.set('Vue.js', { name: 'Vue.js', category: 'frontend', description: 'Progressive JavaScript Framework' });
        if (deps['@angular/core']) frameworks.set('Angular', { name: 'Angular', category: 'frontend', description: 'Enterprise Frontend Framework' });
        if (deps['svelte']) frameworks.set('Svelte', { name: 'Svelte', category: 'frontend', description: 'Compiler-based UI Framework' });
        if (deps['express']) frameworks.set('Express', { name: 'Express', category: 'backend', description: 'Fast Node.js Web Framework' });
        if (deps['fastify']) frameworks.set('Fastify', { name: 'Fastify', category: 'backend', description: 'High-Performance Node.js Framework' });
        if (deps['@nestjs/core']) frameworks.set('NestJS', { name: 'NestJS', category: 'backend', description: 'Enterprise Node.js Framework' });
        if (deps['tailwindcss']) frameworks.set('Tailwind CSS', { name: 'Tailwind CSS', category: 'styling', description: 'Utility-first CSS Framework' });
        if (deps['@prisma/client'] || deps['prisma']) frameworks.set('Prisma', { name: 'Prisma', category: 'orm', description: 'Next-generation TypeScript ORM' });
        if (deps['typeorm']) frameworks.set('TypeORM', { name: 'TypeORM', category: 'orm', description: 'TypeScript Object-Relational Mapper' });
        if (deps['mongoose']) frameworks.set('Mongoose', { name: 'Mongoose', category: 'database', description: 'MongoDB Object Modeling' });
        if (deps['pg'] || deps['postgres']) frameworks.set('PostgreSQL', { name: 'PostgreSQL Driver', category: 'database', description: 'Relational Database Client' });
        if (deps['jest']) frameworks.set('Jest', { name: 'Jest', category: 'testing', description: 'JavaScript Testing Framework' });
        if (deps['vitest']) frameworks.set('Vitest', { name: 'Vitest', category: 'testing', description: 'Vite-native Unit Testing' });
        if (deps['typescript']) frameworks.set('TypeScript', { name: 'TypeScript', category: 'utility', description: 'Typed JavaScript' });
      } catch {
        // continue
      }
    }

    // Check Python requirements
    const pyReqs = scannedFiles.filter(f => f.relativePath.includes('requirements.txt') || f.relativePath.includes('Pipfile') || f.relativePath.includes('pyproject.toml'));
    for (const pyFile of pyReqs) {
      try {
        const content = fs.readFileSync(pyFile.absolutePath, 'utf-8').toLowerCase();
        if (content.includes('django')) frameworks.set('Django', { name: 'Django', category: 'backend', description: 'High-level Python Web Framework' });
        if (content.includes('flask')) frameworks.set('Flask', { name: 'Flask', category: 'backend', description: 'Lightweight Python WSGI App' });
        if (content.includes('fastapi')) frameworks.set('FastAPI', { name: 'FastAPI', category: 'backend', description: 'Modern, Fast Python API Framework' });
        if (content.includes('sqlalchemy')) frameworks.set('SQLAlchemy', { name: 'SQLAlchemy', category: 'orm', description: 'Python SQL Toolkit & ORM' });
        if (content.includes('pytest')) frameworks.set('PyTest', { name: 'PyTest', category: 'testing', description: 'Python Testing Framework' });
        if (content.includes('celery')) frameworks.set('Celery', { name: 'Celery', category: 'backend', description: 'Distributed Task Queue' });
      } catch {
        // continue
      }
    }

    // Check Go dependencies
    const goMod = scannedFiles.find(f => f.relativePath.endsWith('go.mod'));
    if (goMod) {
      try {
        const content = fs.readFileSync(goMod.absolutePath, 'utf-8');
        if (content.includes('github.com/gin-gonic/gin')) frameworks.set('Gin', { name: 'Gin', category: 'backend', description: 'Fast Go HTTP Framework' });
        if (content.includes('github.com/gofiber/fiber')) frameworks.set('Fiber', { name: 'Fiber', category: 'backend', description: 'Express-inspired Go Framework' });
        if (content.includes('gorm.io/gorm')) frameworks.set('GORM', { name: 'GORM', category: 'orm', description: 'Go ORM Library' });
      } catch {
        // continue
      }
    }

    // Check Rust dependencies
    const cargoToml = scannedFiles.find(f => f.relativePath.endsWith('Cargo.toml'));
    if (cargoToml) {
      try {
        const content = fs.readFileSync(cargoToml.absolutePath, 'utf-8');
        if (content.includes('actix-web')) frameworks.set('Actix-Web', { name: 'Actix-Web', category: 'backend', description: 'Rust Async Web Framework' });
        if (content.includes('axum')) frameworks.set('Axum', { name: 'Axum', category: 'backend', description: 'Modular Rust Web Framework' });
        if (content.includes('tokio')) frameworks.set('Tokio', { name: 'Tokio', category: 'utility', description: 'Rust Async Runtime' });
      } catch {
        // continue
      }
    }

    // Check Docker / DevOps
    if (scannedFiles.some(f => f.relativePath.toLowerCase().includes('dockerfile') || f.relativePath.includes('docker-compose'))) {
      frameworks.set('Docker', { name: 'Docker', category: 'devops', description: 'Containerization & Orchestration' });
    }

    return Array.from(frameworks.values());
  }

  /**
   * Detects main entry points in the codebase
   */
  private static detectEntryPoints(scannedFiles: Array<{ relativePath: string; language?: string }>): EntryPoint[] {
    const entryPoints: EntryPoint[] = [];

    const candidates = [
      { pattern: /(?:^|\/)(index|main|app|server)\.(ts|js|mjs)$/i, type: 'api_entry' as const, desc: 'Application / Server entry point' },
      { pattern: /(?:^|\/)src\/(index|main|App)\.(tsx|jsx)$/i, type: 'web_entry' as const, desc: 'Client application root component' },
      { pattern: /(?:^|\/)(main|app|manage|run)\.py$/i, type: 'api_entry' as const, desc: 'Python execution entry point' },
      { pattern: /(?:^|\/)main\.go$/i, type: 'api_entry' as const, desc: 'Go main package entry' },
      { pattern: /(?:^|\/)src\/main\.rs$/i, type: 'cli_entry' as const, desc: 'Rust binary root' },
      { pattern: /(?:^|\/)src\/lib\.rs$/i, type: 'cli_entry' as const, desc: 'Rust library root' },
      { pattern: /(?:^|\/)docker-compose\.ya?ml$/i, type: 'config' as const, desc: 'Docker Compose orchestration file' },
      { pattern: /(?:^|\/)prisma\/schema\.prisma$/i, type: 'config' as const, desc: 'Prisma Database schema definition' },
    ];

    for (const file of scannedFiles) {
      for (const candidate of candidates) {
        if (candidate.pattern.test(file.relativePath)) {
          if (!entryPoints.some(e => e.path === file.relativePath)) {
            entryPoints.push({
              path: file.relativePath,
              type: candidate.type,
              description: candidate.desc,
            });
          }
        }
      }
    }

    return entryPoints.slice(0, 8);
  }
}
