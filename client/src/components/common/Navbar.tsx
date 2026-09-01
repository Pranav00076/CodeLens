import React, { useState } from 'react';
import { Code2, Rocket, Play, Plus, Layers, Settings, Key } from 'lucide-react';
import { RepoAnalysis } from '../../types/index';
import { Badge } from './Badge';
import { ApiKeyModal } from './ApiKeyModal';

interface NavbarProps {
  currentRepo: RepoAnalysis | null;
  onOpenOnboarding: () => void;
  onNewAnalysis: () => void;
  onLoadDemo: () => void;
  isLoadingDemo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRepo,
  onOpenOnboarding,
  onNewAnalysis,
  onLoadDemo,
  isLoadingDemo = false,
}) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#090A0D]/90 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={onNewAnalysis}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 text-white shadow-sm">
              <Code2 className="w-4 h-4 text-zinc-100" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight text-white font-sans">
                CodeLens <span className="text-zinc-400 font-normal">AI</span>
              </span>
              <Badge variant="slate" size="sm">Beta</Badge>
            </div>
          </div>

          {/* Center: Current active repo badge (if active) */}
          {currentRepo && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-md bg-zinc-900/90 border border-white/[0.08] text-xs">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-medium text-zinc-200 max-w-[200px] truncate">{currentRepo.name}</span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">{currentRepo.stats.totalFiles} files</span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-medium">{currentRepo.stats.healthScore}/100 Health</span>
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* AI Engine Settings */}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-white/[0.06] transition-colors"
              title="AI Engine Settings (Gemini / Offline Heuristic)"
            >
              <Key className="w-3.5 h-3.5" />
            </button>

            {currentRepo ? (
              <>
                {/* Onboarding Mode Button */}
                <button
                  onClick={onOpenOnboarding}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all active:scale-95"
                >
                  <Rocket className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Understand Codebase</span>
                </button>

                {/* New Repo */}
                <button
                  onClick={onNewAnalysis}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">New Repo</span>
                </button>
              </>
            ) : (
              <>
                {/* Try Demo Repository CTA */}
                <button
                  onClick={onLoadDemo}
                  disabled={isLoadingDemo}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/[0.1] transition-all hover:border-white/20 active:scale-95 shadow-sm"
                >
                  <Play className="w-3 h-3 text-zinc-300 fill-zinc-300" />
                  <span>{isLoadingDemo ? 'Loading Demo...' : 'Try Demo Repository'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* AI Key / Engine Modal */}
      <ApiKeyModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};
