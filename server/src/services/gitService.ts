import { simpleGit, SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import { config } from '../config.js';

export class GitService {
  /**
   * Validates and normalizes GitHub repo URL
   */
  static validateAndNormalizeUrl(inputUrl: string): { valid: boolean; normalizedUrl?: string; repoName?: string; error?: string } {
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

      return { valid: true, normalizedUrl, repoName };
    } catch (err) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Clones a repository into a temporary directory
   */
  static async cloneRepository(
    repoUrl: string,
    targetDir: string,
    onProgress?: (msg: string) => void
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      fs.mkdirSync(targetDir, { recursive: true });

      const git: SimpleGit = simpleGit({
        timeout: {
          block: config.cloneTimeoutMs,
        },
      });

      if (onProgress) onProgress(`Connecting to ${repoUrl}...`);

      await git.clone(repoUrl, targetDir, [
        '--depth', '1',
        '--single-branch',
        '--no-tags',
      ]);

      if (onProgress) onProgress('Cloning completed successfully.');
      return { success: true };
    } catch (err: any) {
      console.error('Git clone error:', err);
      // Clean up directory on failure
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      return {
        success: false,
        error: err.message?.includes('Authentication failed')
          ? 'Failed to clone repository. Please check if the repository is public.'
          : (err.message || 'Failed to clone repository'),
      };
    }
  }
}
