import React from 'react';
import { FileCode, Cpu, ArrowRight } from 'lucide-react';
import { RepoAnalysis } from '../../types/index';
import { ArchitectureMap } from './ArchitectureMap';
import { Badge } from '../common/Badge';

interface OverviewTabProps {
  repo: RepoAnalysis;
  onSelectFile: (filePath: string) => void;
  onOpenOnboarding: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  repo,
  onSelectFile,
  onOpenOnboarding,
}) => {
  return (
    <div className="space-y-6 p-5 sm:p-6 max-w-7xl mx-auto">
      {/* Executive Summary Card */}
      <div className="p-5 sm:p-6 rounded-xl bg-[#0E1015] border border-white/[0.08] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Executive Technical Summary</span>
              <Badge variant="slate" size="sm">{repo.architecture.pattern}</Badge>
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white leading-snug">
              {repo.summary}
            </h3>
            <p className="text-xs text-zinc-400">
              {repo.architecture.overview}
            </p>
          </div>

          <button
            onClick={onOpenOnboarding}
            className="self-start md:self-center shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all active:scale-95"
          >
            <span>Understand Codebase</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tech Stack & Metric Counters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Languages Breakdown */}
        <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Languages Breakdown</h4>
            <span className="text-[10px] text-zinc-500 font-mono">{repo.languages.length} Detected</span>
          </div>

          {/* Progress bar stack */}
          <div className="h-1.5 w-full rounded-full bg-zinc-800 flex overflow-hidden">
            {repo.languages.map((lang, idx) => (
              <div
                key={idx}
                style={{ width: `${lang.percentage}%`, backgroundColor: lang.color || '#A1A1AA' }}
                title={`${lang.name}: ${lang.percentage}%`}
              />
            ))}
          </div>

          <div className="space-y-1.5">
            {repo.languages.map((lang, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lang.color || '#A1A1AA' }}
                  />
                  <span className="text-zinc-300 font-medium text-[11px]">{lang.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-zinc-500 text-[11px]">
                  <span>{lang.fileCount} files</span>
                  <span className="text-zinc-300 font-semibold">{lang.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Frameworks & Infrastructure */}
        <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Frameworks & Tools</h4>
            <span className="text-[10px] text-zinc-500 font-mono">{repo.frameworks.length} Total</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {repo.frameworks.map((f, idx) => (
              <div
                key={idx}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900/90 border border-white/[0.06] text-xs space-y-0.5"
              >
                <div className="flex items-center gap-1.5 font-medium text-zinc-200 text-[11px]">
                  <Cpu className="w-3 h-3 text-zinc-400" />
                  <span>{f.name}</span>
                </div>
                <p className="text-[10px] text-zinc-500 line-clamp-1">{f.description || f.category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Entry Points */}
        <div className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.07] space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">Key Entry Points</h4>
            <span className="text-[10px] text-zinc-500 font-mono">Bootstrap Roots</span>
          </div>

          <div className="space-y-1.5">
            {repo.entryPoints.map((ep, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFile(ep.path)}
                className="w-full flex items-start justify-between p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-white/[0.05] text-left transition-colors group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono font-medium text-zinc-200 truncate">
                    <FileCode className="w-3 h-3 text-zinc-400 shrink-0" />
                    <span className="truncate">{ep.path}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{ep.description}</p>
                </div>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                  {ep.type.replace('_', ' ')}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Architecture Map Section */}
      <div className="pt-2">
        <ArchitectureMap
          architecture={repo.architecture}
          onSelectFile={onSelectFile}
        />
      </div>

      {/* Layer Breakdown */}
      {repo.architecture.layers.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">System Functional Layers</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repo.architecture.layers.map((layer, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0E1015] border border-white/[0.07] space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  <h5 className="font-semibold text-xs text-white">{layer.name}</h5>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">{layer.purpose}</p>

                {layer.files.length > 0 && (
                  <div className="pt-2 border-t border-white/[0.05]">
                    <span className="text-[10px] font-medium text-zinc-500 block mb-1">Associated Files:</span>
                    <div className="flex flex-wrap gap-1">
                      {layer.files.map((f, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => onSelectFile(f)}
                          className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-white/[0.05] text-[10px] font-mono text-zinc-300 hover:text-white"
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
