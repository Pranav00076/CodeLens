import React, { useState, useEffect } from 'react';
import { Search, FileCode, Layers, ShieldAlert, Sparkles, MessageSquare, Rocket, X } from 'lucide-react';
import { RepoAnalysis, TabType } from '../../types/index';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  currentRepo: RepoAnalysis | null;
  onSelectTab: (tab: TabType) => void;
  onSelectFile: (filePath: string) => void;
  onOpenOnboarding: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  currentRepo,
  onSelectTab,
  onSelectFile,
  onOpenOnboarding,
}) => {
  const [query, setQuery] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten files for search
  const allFiles: string[] = [];
  if (currentRepo) {
    const traverse = (node: any) => {
      if (node.type === 'file') allFiles.push(node.path);
      if (node.children) node.children.forEach(traverse);
    };
    traverse(currentRepo.fileTree);
  }

  const filteredFiles = allFiles
    .filter(f => f.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  const filteredIssues = currentRepo?.issues
    .filter(i => i.title.toLowerCase().includes(query.toLowerCase()) || i.filePath.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 4) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-[#0F1116] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#14161D]">
          <Search className="w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, file name, or search term... (ESC to close)"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none font-sans"
            autoFocus
          />
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action List */}
        <div className="p-3 max-h-[420px] overflow-y-auto space-y-4">
          {/* Quick Navigation Commands */}
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-3 py-1">
              Navigation & Actions
            </div>
            <div className="space-y-1 mt-1">
              <button
                onClick={() => { onOpenOnboarding(); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-zinc-200 hover:bg-white/[0.05] transition-colors group"
              >
                <Rocket className="w-4 h-4 text-zinc-300" />
                <span className="font-medium">🚀 Understand This Codebase (Developer Onboarding)</span>
              </button>
              <button
                onClick={() => { onSelectTab('overview'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-zinc-300 hover:bg-white/[0.04] transition-colors"
              >
                <Layers className="w-4 h-4 text-zinc-400" />
                <span>Go to Architecture & Overview</span>
              </button>
              <button
                onClick={() => { onSelectTab('insights'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-zinc-300 hover:bg-white/[0.04] transition-colors"
              >
                <ShieldAlert className="w-4 h-4 text-zinc-400" />
                <span>Go to Code Insights & Health Audit</span>
              </button>
              <button
                onClick={() => { onSelectTab('tests'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-zinc-300 hover:bg-white/[0.04] transition-colors"
              >
                <Sparkles className="w-4 h-4 text-zinc-400" />
                <span>Go to AI Unit Test Generator</span>
              </button>
              <button
                onClick={() => { onSelectTab('chat'); onClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-left text-zinc-300 hover:bg-white/[0.04] transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <span>Go to Ask CodeLens AI Chat</span>
              </button>
            </div>
          </div>

          {/* Files */}
          {filteredFiles.length > 0 && (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-3 py-1">
                Repository Files
              </div>
              <div className="space-y-1 mt-1">
                {filteredFiles.map((file, idx) => (
                  <button
                    key={idx}
                    onClick={() => { onSelectFile(file); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileCode className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span className="font-mono text-xs truncate">{file}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 shrink-0 font-sans">Open File</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detected Issues */}
          {filteredIssues.length > 0 && (
            <div>
              <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500 px-3 py-1">
                Detected Code Smells & Issues
              </div>
              <div className="space-y-1 mt-1">
                {filteredIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => { onSelectTab('insights'); onClose(); }}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-left text-zinc-300 hover:bg-white/[0.04] hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">{issue.title}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">{issue.filePath}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#0A0B0E] border-t border-white/[0.06] text-[11px] text-zinc-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">↑↓</span>
            <span>Navigate</span>
            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px]">↵</span>
            <span>Select</span>
          </div>
          <span>CodeLens AI Command Palette</span>
        </div>
      </div>
    </div>
  );
};
