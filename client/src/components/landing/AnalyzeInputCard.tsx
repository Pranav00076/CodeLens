import React, { useState } from 'react';
import { Github, Upload, Sparkles, ArrowRight, FolderArchive, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AnalyzeInputCardProps {
  onAnalyzeGithub: (url: string) => void;
  onAnalyzeZip: (file: File) => void;
  isLoading: boolean;
}

export const AnalyzeInputCard: React.FC<AnalyzeInputCardProps> = ({
  onAnalyzeGithub,
  onAnalyzeZip,
  isLoading,
}) => {
  const [tab, setTab] = useState<'github' | 'zip'>('github');
  const [githubUrl, setGithubUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sampleRepos = [
    { name: 'ShopSphere Cloud (Demo)', url: 'demo' },
    { name: 'expressjs/express', url: 'https://github.com/expressjs/express' },
    { name: 'facebook/react', url: 'https://github.com/facebook/react' },
  ];

  const handleGithubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!githubUrl.trim()) {
      setError('Please provide a valid GitHub repository URL.');
      return;
    }
    onAnalyzeGithub(githubUrl.trim());
  };

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedFile) {
      setError('Please select or drop a .zip archive of your project.');
      return;
    }
    onAnalyzeZip(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Only .zip files are supported.');
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="rounded-xl bg-[#0F1116] border border-white/[0.08] p-6 sm:p-7 shadow-2xl">
        {/* Tab Selector */}
        <div className="flex items-center justify-center p-1 mb-6 rounded-lg bg-zinc-950 border border-white/[0.06] max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => { setTab('github'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === 'github'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub URL</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('zip'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              tab === 'zip'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload ZIP</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* GitHub Form */}
        {tab === 'github' && (
          <form onSubmit={handleGithubSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                GitHub Repository URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Github className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/owner/repository"
                  className="w-full pl-9 pr-4 py-2.5 bg-[#090A0D] border border-white/[0.08] focus:border-white/30 rounded-lg text-xs sm:text-sm text-zinc-100 placeholder:text-zinc-600 font-mono transition-all outline-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Quick Sample Links */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <span className="text-zinc-500 text-[11px]">Quick Try:</span>
              {sampleRepos.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setGithubUrl(s.url === 'demo' ? 'https://github.com/shopsphere/enterprise-cloud' : s.url)}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 text-[11px] font-mono border border-white/[0.06] transition-colors"
                >
                  {s.name}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg font-medium text-xs sm:text-sm bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-zinc-900" />
              <span>{isLoading ? 'Analyzing Codebase...' : 'Analyze Codebase'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ZIP Upload Form */}
        {tab === 'zip' && (
          <form onSubmit={handleZipSubmit} className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-white/40 bg-white/[0.04]'
                  : selectedFile
                  ? 'border-emerald-500/40 bg-emerald-500/[0.03]'
                  : 'border-white/[0.1] hover:border-white/20 bg-[#090A0D]'
              }`}
              onClick={() => document.getElementById('zip-file-input')?.click()}
            >
              <input
                id="zip-file-input"
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setSelectedFile(e.target.files[0]);
                    setError(null);
                  }
                }}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                  <span className="font-medium text-xs sm:text-sm text-zinc-200">{selectedFile.name}</span>
                  <span className="text-[11px] text-zinc-500 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB — Ready to analyze
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <FolderArchive className="w-8 h-8 text-zinc-500 mb-2" />
                  <span className="font-medium text-xs sm:text-sm text-zinc-200">
                    Drop your project ZIP file here, or <span className="text-zinc-400 underline">browse</span>
                  </span>
                  <span className="text-[11px] text-zinc-500 mt-1">
                    Ignores node_modules, .git, and binaries automatically.
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !selectedFile}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg font-medium text-xs sm:text-sm bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all active:scale-98 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-zinc-900" />
              <span>{isLoading ? 'Analyzing Codebase...' : 'Analyze Uploaded Archive'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
