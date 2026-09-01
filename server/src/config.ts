import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const TEMP_DIR = path.join(DATA_DIR, 'temp');
const REPOS_DIR = path.join(DATA_DIR, 'repos');

// Ensure base directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });
if (!fs.existsSync(REPOS_DIR)) fs.mkdirSync(REPOS_DIR, { recursive: true });

export const config = {
  port: parseInt(process.env.PORT || '5001', 10),
  dataDir: DATA_DIR,
  tempDir: TEMP_DIR,
  reposDir: REPOS_DIR,
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'auto',
  maxRepoSizeMB: parseInt(process.env.MAX_REPO_SIZE_MB || '50', 10),
  maxFileCount: parseInt(process.env.MAX_FILE_COUNT || '2500', 10),
  cloneTimeoutMs: 60000,
};
