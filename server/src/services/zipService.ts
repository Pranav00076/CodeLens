import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

export class ZipService {
  /**
   * Extracts a zip file safely into target directory, avoiding Zip Slip vulnerabilities
   */
  static extractZip(zipFilePath: string, targetDir: string): { success: boolean; rootDir: string; error?: string } {
    try {
      if (!fs.existsSync(zipFilePath)) {
        return { success: false, rootDir: '', error: 'ZIP file not found' };
      }

      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      fs.mkdirSync(targetDir, { recursive: true });

      const zip = new AdmZip(zipFilePath);
      const zipEntries = zip.getEntries();

      for (const entry of zipEntries) {
        // Zip Slip check
        const entryPath = entry.entryName;
        const normalizedTarget = path.normalize(targetDir);
        const resolvedPath = path.resolve(targetDir, entryPath);

        if (!resolvedPath.startsWith(normalizedTarget)) {
          throw new Error(`Security Exception: Zip Slip path traversal attempt: ${entryPath}`);
        }

        if (entry.isDirectory) {
          fs.mkdirSync(resolvedPath, { recursive: true });
        } else {
          const parentDir = path.dirname(resolvedPath);
          if (!fs.existsSync(parentDir)) {
            fs.mkdirSync(parentDir, { recursive: true });
          }
          fs.writeFileSync(resolvedPath, entry.getData());
        }
      }

      // Check if all files are inside a single root folder (common in GitHub zip archives)
      const items = fs.readdirSync(targetDir);
      let effectiveRoot = targetDir;
      if (items.length === 1 && fs.statSync(path.join(targetDir, items[0])).isDirectory()) {
        effectiveRoot = path.join(targetDir, items[0]);
      }

      return { success: true, rootDir: effectiveRoot };
    } catch (err: any) {
      console.error('ZIP extraction error:', err);
      return { success: false, rootDir: '', error: err.message || 'Failed to extract ZIP archive' };
    }
  }
}
