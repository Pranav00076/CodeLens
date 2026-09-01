export interface CodeChunk {
  filePath: string;
  chunkIndex: number;
  totalChunks: number;
  startLine: number;
  endLine: number;
  content: string;
  symbols: string[];
}

export class ChunkerService {
  /**
   * Chunks code intelligently by finding natural boundaries like function/class definitions
   */
  static chunkFile(filePath: string, content: string, maxLinesPerChunk: number = 200): CodeChunk[] {
    const lines = content.split('\n');
    if (lines.length <= maxLinesPerChunk) {
      return [{
        filePath,
        chunkIndex: 0,
        totalChunks: 1,
        startLine: 1,
        endLine: lines.length,
        content,
        symbols: this.extractSymbols(content),
      }];
    }

    const chunks: CodeChunk[] = [];
    let currentChunkLines: string[] = [];
    let startLine = 1;
    let i = 0;

    while (i < lines.length) {
      currentChunkLines.push(lines[i]);

      const isBoundary = lines[i].match(/^(export\s+)?(function|class|interface|type|const|let|var|def|class|pub\s+fn|func)\s+/);
      const isLargeEnough = currentChunkLines.length >= maxLinesPerChunk;

      if (isLargeEnough || (currentChunkLines.length >= Math.floor(maxLinesPerChunk * 0.75) && isBoundary)) {
        const chunkContent = currentChunkLines.join('\n');
        chunks.push({
          filePath,
          chunkIndex: chunks.length,
          totalChunks: 0, // updated at end
          startLine,
          endLine: startLine + currentChunkLines.length - 1,
          content: chunkContent,
          symbols: this.extractSymbols(chunkContent),
        });

        startLine = startLine + currentChunkLines.length;
        currentChunkLines = [];
      }
      i++;
    }

    if (currentChunkLines.length > 0) {
      const chunkContent = currentChunkLines.join('\n');
      chunks.push({
        filePath,
        chunkIndex: chunks.length,
        totalChunks: 0,
        startLine,
        endLine: startLine + currentChunkLines.length - 1,
        content: chunkContent,
        symbols: this.extractSymbols(chunkContent),
      });
    }

    // Update totalChunks
    chunks.forEach(c => c.totalChunks = chunks.length);
    return chunks;
  }

  /**
   * Extracts function, class, and interface symbols from code snippet
   */
  static extractSymbols(content: string): string[] {
    const symbols: Set<string> = new Set();
    const functionRegex = /(?:function\s+([a-zA-Z0-9_$]+)|const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>|def\s+([a-zA-Z0-9_$]+)|fn\s+([a-zA-Z0-9_$]+)|func\s+([a-zA-Z0-9_$]+))/g;
    const classRegex = /(?:class|interface|type|struct|enum)\s+([a-zA-Z0-9_$]+)/g;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3] || match[4] || match[5];
      if (name) symbols.add(name);
    }

    while ((match = classRegex.exec(content)) !== null) {
      if (match[1]) symbols.add(match[1]);
    }

    return Array.from(symbols).slice(0, 15);
  }

  /**
   * Generates a concise context representation of the entire repository for AI
   */
  static generateRepoContextSummary(files: Array<{ relativePath: string; lines: number; sampleContent?: string; language?: string }>): string {
    const fileList = files.slice(0, 50).map(f => {
      const symbols = f.sampleContent ? this.extractSymbols(f.sampleContent).join(', ') : '';
      return `- ${f.relativePath} (${f.lines} lines, ${f.language || 'Code'}) ${symbols ? `[Key exports/symbols: ${symbols}]` : ''}`;
    }).join('\n');

    return `Repository File Outline:\n${fileList}`;
  }
}
