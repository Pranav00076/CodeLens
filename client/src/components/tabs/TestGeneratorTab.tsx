import React, { useState } from 'react';
import { Sparkles, FileCode, Check, Download, AlertCircle, Loader2 } from 'lucide-react';
import { RepoAnalysis, GeneratedTest } from '../../types/index';
import { api } from '../../services/api';
import { CodeBlock } from '../common/CodeBlock';
import { Badge } from '../common/Badge';

interface TestGeneratorTabProps {
  repo: RepoAnalysis;
  onSelectFile: (filePath: string) => void;
}

export const TestGeneratorTab: React.FC<TestGeneratorTabProps> = ({
  repo,
  onSelectFile,
}) => {
  // Extract all files from tree
  const fileOptions: string[] = [];
  const traverse = (node: any) => {
    if (node.type === 'file') fileOptions.push(node.path);
    if (node.children) node.children.forEach(traverse);
  };
  traverse(repo.fileTree);

  const codeFiles = fileOptions.filter(f => {
    const ext = f.split('.').pop()?.toLowerCase() || '';
    return ['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'java', 'cpp'].includes(ext);
  });

  const [selectedFile, setSelectedFile] = useState<string>(
    codeFiles.find(f => f.includes('orderProcessor') || f.includes('auth') || f.includes('controller') || f.includes('service')) || codeFiles[0] || ''
  );
  const [targetFunction, setTargetFunction] = useState<string>('');
  const [framework, setFramework] = useState<string>('Vitest');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!selectedFile) return;
    setIsGenerating(true);
    setError(null);

    try {
      const result = await api.generateTests(repo.id, selectedFile, targetFunction || undefined, framework);
      setGeneratedTest(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate test cases');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedTest) return;
    const blob = new Blob([generatedTest.code], { type: 'text/typescript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = framework.toLowerCase() === 'pytest' ? '.test.py' : '.test.ts';
    a.href = url;
    a.download = `${generatedTest.targetFile.replace(/\.[^/.]+$/, '')}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 p-5 sm:p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Automated Unit Test Generator</h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Select any file or function to generate full test suites with mocked dependencies, happy paths, and boundary edge cases.
          </p>
        </div>
        <Badge variant="slate" size="md">Test Coverage Assistant</Badge>
      </div>

      {/* Generator Configuration Card */}
      <div className="p-4 sm:p-5 rounded-xl bg-[#0E1015] border border-white/[0.07] space-y-4">
        <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          Target File & Test Framework
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* File Selector */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300 font-medium block">Target Source File</label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="w-full p-2 bg-[#090A0D] border border-white/[0.08] rounded-lg text-xs text-zinc-200 font-mono focus:outline-none focus:border-white/20"
            >
              {codeFiles.map((f, idx) => (
                <option key={idx} value={f}>{f}</option>
              ))}
            </select>
          </div>

          {/* Target Function Name */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300 font-medium block">
              Specific Function <span className="text-zinc-500">(Optional)</span>
            </label>
            <input
              type="text"
              value={targetFunction}
              onChange={(e) => setTargetFunction(e.target.value)}
              placeholder="e.g. processCheckout"
              className="w-full p-2 bg-[#090A0D] border border-white/[0.08] rounded-lg text-xs text-zinc-200 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-white/20"
            />
          </div>

          {/* Test Framework */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-300 font-medium block">Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              className="w-full p-2 bg-[#090A0D] border border-white/[0.08] rounded-lg text-xs text-zinc-200 font-sans focus:outline-none focus:border-white/20"
            >
              <option value="Vitest">Vitest</option>
              <option value="Jest">Jest</option>
              <option value="PyTest">PyTest</option>
              <option value="Mocha">Mocha</option>
              <option value="GoTest">Go testing</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !selectedFile}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all active:scale-98 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
                <span>Generate Tests</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Generated Test Result */}
      {generatedTest && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Summary Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Rationale */}
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Testing Strategy</span>
              <p className="text-xs text-zinc-300 leading-relaxed">{generatedTest.rationale}</p>
            </div>

            {/* Edge cases */}
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Edge Cases Covered</span>
              <ul className="text-xs text-zinc-300 space-y-1">
                {generatedTest.edgeCases.map((ec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-zinc-500 font-bold">•</span>
                    <span>{ec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Expected Outputs */}
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Expected Assertions</span>
              <ul className="text-xs text-zinc-300 space-y-1">
                {generatedTest.expectedOutputs.map((eo, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{eo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Test Code Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <FileCode className="w-4 h-4 text-zinc-400" />
                <span>Generated Test Suite ({generatedTest.framework})</span>
              </div>

              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-sans transition-colors border border-white/[0.06]"
              >
                <Download className="w-3.5 h-3.5 text-zinc-300" />
                <span>Download File</span>
              </button>
            </div>

            <CodeBlock
              code={generatedTest.code}
              language="typescript"
              filename={`${generatedTest.targetFile}.spec.ts`}
              maxHeight="500px"
            />
          </div>
        </div>
      )}
    </div>
  );
};
