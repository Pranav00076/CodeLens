import React from 'react';
import { ArrowRight, Play, Zap, Code, ShieldCheck, Terminal } from 'lucide-react';

interface HeroSectionProps {
  onAnalyzeClick: () => void;
  onLoadDemo: () => void;
  isLoadingDemo?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyzeClick,
  onLoadDemo,
  isLoadingDemo = false,
}) => {
  return (
    <section className="relative pt-16 pb-16 overflow-hidden">
      {/* Subtle, soft ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-white/[0.02] blur-[100px] pointer-events-none -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-zinc-300 text-xs font-medium mb-6 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>AI Codebase Intelligence & Architecture Engine</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-400">v1.0</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-white font-sans leading-[1.12] mb-6">
          Understand any codebase in <br className="hidden sm:block" />
          <span className="text-zinc-400">minutes, not days.</span>
        </h1>

        {/* Subtitle / Problem Description */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-400 mb-8 leading-relaxed font-normal">
          Stop getting lost in unfamiliar files. CodeLens AI maps project architecture, audits code smells with ready-to-apply diffs, generates unit tests, and guides you through an interactive onboarding roadmap.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <button
            onClick={onAnalyzeClick}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-xs sm:text-sm bg-white text-zinc-950 hover:bg-zinc-200 shadow-sm transition-all active:scale-98"
          >
            <span>Analyze Repository</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onLoadDemo}
            disabled={isLoadingDemo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium text-xs sm:text-sm bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-white/[0.08] shadow-sm transition-all active:scale-98"
          >
            <Play className="w-3.5 h-3.5 text-zinc-300 fill-zinc-300" />
            <span>{isLoadingDemo ? 'Loading Demo...' : 'Try Demo Repository'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">1-Click</span>
          </button>
        </div>

        {/* Value Proposition Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-white/[0.06] text-left">
          <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/[0.05]">
            <div className="flex items-center gap-2 text-zinc-300 mb-1">
              <Zap className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-xs text-zinc-200">10x Faster</span>
            </div>
            <p className="text-[11px] text-zinc-500">Developer onboarding</p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/[0.05]">
            <div className="flex items-center gap-2 text-zinc-300 mb-1">
              <Code className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-xs text-zinc-200">Visual Map</span>
            </div>
            <p className="text-[11px] text-zinc-500">Architecture flow graphs</p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/[0.05]">
            <div className="flex items-center gap-2 text-zinc-300 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-xs text-zinc-200">Auto Fixes</span>
            </div>
            <p className="text-[11px] text-zinc-500">Bugs & code smell diffs</p>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900/40 border border-white/[0.05]">
            <div className="flex items-center gap-2 text-zinc-300 mb-1">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-semibold text-xs text-zinc-200">Unit Tests</span>
            </div>
            <p className="text-[11px] text-zinc-500">Instant edge case suites</p>
          </div>
        </div>
      </div>
    </section>
  );
};
