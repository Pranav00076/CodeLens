import { simpleGit } from 'simple-git';
import fs from 'fs';
import { ZipService } from './zipService.js';
import { config } from '../config.js';
export class GitService {
    /**
     * Validates and normalizes GitHub repo URL
     */
    static validateAndNormalizeUrl(inputUrl) {
        let cleanUrl = inputUrl.trim();
        if (!cleanUrl) {
            return { valid: false, error: 'Repository URL is required' };
        }
        if (cleanUrl.startsWith('git@github.com:')) {
            cleanUrl = cleanUrl.replace('git@github.com:', 'https://github.com/');
        }
        if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
            cleanUrl = 'https://' + cleanUrl;
        }
        try {
            const parsed = new URL(cleanUrl);
            if (!parsed.hostname.includes('github.com') && !parsed.hostname.includes('gitlab.com') && !parsed.hostname.includes('bitbucket.org')) {
                return { valid: false, error: 'Only GitHub, GitLab, and Bitbucket URLs are supported' };
            }
            const pathParts = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/');
            if (pathParts.length < 2) {
                return { valid: false, error: 'Invalid repository path. Format must be https://github.com/owner/repo' };
            }
            const owner = pathParts[0];
            const repo = pathParts[1].replace(/\.git$/, '');
            const normalizedUrl = `https://github.com/${owner}/${repo}`;
            const repoName = `${owner}/${repo}`;
            return { valid: true, normalizedUrl, repoName, owner, repo };
        }
        catch (err) {
            return { valid: false, error: 'Invalid URL format' };
        }
    }
    /**
     * Downloads or clones a repository into a directory (serverless safe)
     */
    static async cloneRepository(repoUrl, targetDir, onProgress) {
        const validation = this.validateAndNormalizeUrl(repoUrl);
        // 1. If it's a public GitHub repo, try direct fast HTTP zipball fetch first (Works in Serverless / Lambda / Vercel without git CLI)
        if (validation.valid && validation.owner && validation.repo) {
            const zipDownloadResult = await this.downloadGitHubZip(validation.owner, validation.repo, targetDir, onProgress);
            if (zipDownloadResult.success) {
                return zipDownloadResult;
            }
            console.warn('Direct GitHub zip download failed, attempting git clone fallback:', zipDownloadResult.error);
        }
        // 2. Git CLI clone fallback
        try {
            if (fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true, force: true });
            }
            fs.mkdirSync(targetDir, { recursive: true });
            const git = simpleGit({
                timeout: {
                    block: config.cloneTimeoutMs,
                },
            });
            if (onProgress)
                onProgress(`Cloning ${repoUrl}...`);
            await git.clone(repoUrl, targetDir, [
                '--depth', '1',
                '--single-branch',
                '--no-tags',
            ]);
            if (onProgress)
                onProgress('Cloning completed successfully.');
            return { success: true, rootDir: targetDir };
        }
        catch (err) {
            console.error('Git clone error:', err);
            if (fs.existsSync(targetDir)) {
                fs.rmSync(targetDir, { recursive: true, force: true });
            }
            return {
                success: false,
                error: err.message?.includes('Authentication failed')
                    ? 'Failed to clone repository. Please check if the repository is public.'
                    : (err.message || 'Failed to clone repository. Please ensure the repository is public and accessible.'),
            };
        }
    }
    /**
     * Downloads repository zip archive directly via HTTP (Zero git CLI dependency)
     */
    static async downloadGitHubZip(owner, repo, targetDir, onProgress) {
        const urls = [
            `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`,
            `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`,
            `https://api.github.com/repos/${owner}/${repo}/zipball`,
        ];
        for (const url of urls) {
            try {
                if (onProgress)
                    onProgress(`Fetching repository archive from ${url}...`);
                const res = await fetch(url, {
                    headers: {
                        'User-Agent': 'CodeLens-AI',
                        'Accept': 'application/vnd.github.v3+json, application/zip',
                    },
                    redirect: 'follow',
                });
                if (res.ok) {
                    const arrayBuffer = await res.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    const extractResult = ZipService.extractZipBuffer(buffer, targetDir);
                    if (extractResult.success) {
                        return { success: true, rootDir: extractResult.rootDir };
                    }
                }
            }
            catch (err) {
                console.warn(`Failed fetching from ${url}:`, err.message);
            }
        }
        return { success: false, error: 'Could not download repository archive from GitHub' };
    }
}
