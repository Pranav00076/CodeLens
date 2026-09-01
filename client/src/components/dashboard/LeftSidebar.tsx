import React from 'react';
import { Rocket, FolderTree, GitBranch } from 'lucide-react';
import { RepoAnalysis } from '../../types/index';
import { FileExplorer } from './FileExplorer';

interface LeftSidebarProps {
  repo: RepoAnalysis;
  selectedFile: string | null;
  onSelectFile: (filePath: string) => void;
  onOpenOnboarding: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  repo,
  selectedFile,
  onSelectFile,
  onOpenOnboarding,
}) => {
  return (
    <aside className="w-full lg:w-64 bg-[#0D0E12] border-r border-white/[0.07] flex flex-col shrink-0">
      {/* Repo Header Box */}
      <div className="p-3.5 border-b border-white/[0.07] space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-xs text-white truncate" title={repo.name}>
              {repo.name}
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 mt-0.5 font-mono">
              <GitBranch className="w-3 h-3 text-zinc-400" />
              <span>{repo.branch || 'main'}</span>
              <span>•</span>
              <span>{repo.stats.totalFiles} files</span>
            </div>
          </div>

          {/* Health Score Pill */}
          <div className="flex flex-col items-end shrink-0">
            <span
              className={`text-[11px] font-medium font-mono px-2 py-0.5 rounded ${
                repo.stats.healthScore >= 80
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}
            >
              {repo.stats.healthScore}/100
            </span>
          </div>
        </div>

        {/* 🚀 Understand This Codebase CTA Button */}
        <button
          onClick={onOpenOnboarding}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-xs bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all active:scale-98"
        >
          <Rocket className="w-3.5 h-3.5 text-zinc-950" />
          <span>Understand Codebase</span>
        </button>

        {/* Tech Badges */}
        <div className="flex flex-wrap gap-1 pt-0.5">
          {repo.languages.slice(0, 3).map((l, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-white/[0.06] text-zinc-400 font-mono"
            >
              {l.name} {l.percentage}%
            </span>
          ))}
          {repo.frameworks.slice(0, 2).map((f, idx) => (
            <span
              key={idx}
              className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-900 border border-white/[0.06] text-zinc-300 font-sans"
            >
              {f.name}
            </span>
          ))}
        </div>
      </div>

      {/* Explorer Header */}
      <div className="px-3 py-1.5 bg-[#090A0D] border-b border-white/[0.06] flex items-center justify-between text-[11px] font-medium text-zinc-400">
        <div className="flex items-center gap-1.5">
          <FolderTree className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[10px] uppercase tracking-wider text-zinc-500">Explorer</span>
        </div>
        <span className="text-[10px] text-zinc-500 font-mono">{repo.stats.totalLines.toLocaleString()} LOC</span>
      </div>

      {/* Interactive File Tree */}
      <div className="flex-1 overflow-hidden">
        <FileExplorer
          tree={repo.fileTree}
          selectedFile={selectedFile}
          onSelectFile={onSelectFile}
        />
      </div>
    </aside>
  );
};
