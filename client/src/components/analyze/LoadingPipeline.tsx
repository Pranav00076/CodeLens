import React, { useState, useEffect } from 'react';
import { GitBranch, FileSearch, Cpu, Network, ShieldCheck, Sparkles, CheckCircle2, Loader2, Terminal } from 'lucide-react';

interface LoadingPipelineProps {
  repoName?: string;
  sourceType?: 'github' | 'upload' | 'demo';
}

interface StageInfo {
  id: number;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

export const LoadingPipeline: React.FC<LoadingPipelineProps> = ({
  repoName = 'Repository',
  sourceType = 'github',
}) => {
  const [currentStage, setCurrentStage] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const stages: StageInfo[] = [
    { id: 1, label: 'Cloning Repository', desc: 'Cloning tree & verifying repository integrity', icon: <GitBranch className="w-4 h-4" /> },
    { id: 2, label: 'Reading Project Files', desc: 'Filtering node_modules, binaries & building AST index', icon: <FileSearch className="w-4 h-4" /> },
    { id: 3, label: 'Detecting Technologies', desc: 'Analyzing languages, manifests & framework dependencies', icon: <Cpu className="w-4 h-4" /> },
    { id: 4, label: 'Mapping Dependencies', desc: 'Tracing imports, call graphs & entry controllers', icon: <Network className="w-4 h-4" /> },
    { id: 5, label: 'Analyzing Architecture', desc: 'Classifying microservices, layers, and data flow patterns', icon: <Cpu className="w-4 h-4" /> },
    { id: 6, label: 'Finding Potential Issues', desc: 'Auditing security vectors, bugs, and code smells', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 7, label: 'Generating AI Insights', desc: 'Synthesizing 7-day onboarding guide & test models', icon: <Sparkles className="w-4 h-4" /> },
  ];

  const tips = [
    '💡 Tip: CodeLens AI automatically strips node_modules and build artifacts to maximize analysis throughput.',
    '💡 Tip: In the dashboard, click any issue to view a live unified diff patch ready to apply.',
    '💡 Tip: Press ⌘K or Ctrl+K anywhere to open the instant Command Palette.',
    '💡 Tip: Use the 🚀 Understand This Codebase mode to get an interactive 7-day contribution guide.',
  ];
  const [tipIndex, setTipIndex] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Tip cycler
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(tipTimer);
  }, [tips.length]);

  // Simulate progressive stages & log lines
  useEffect(() => {
    const logMessages = [
      `[INGEST] Initializing ingestion for ${repoName}...`,
      `[GIT] Fetching shallow git commit tree (--depth 1)...`,
      `[SCAN] Parsing directory structure, ignoring node_modules, .git, and binaries...`,
      `[SCAN] Indexed project files. Extracted symbols and imports.`,
      `[DETECT] Primary languages and framework dependencies identified.`,
      `[GRAPH] Constructing component dependency and data-flow map...`,
      `[ARCH] Identified architecture topology & subsystem boundaries.`,
      `[AUDIT] Scanning AST for security vulnerabilities, hardcoded keys, and performance smells...`,
      `[AI] Chunking context tokens for LLM synthesis...`,
      `[AI] Formulating 7-day developer onboarding journey and test models...`,
      `[DONE] Assembling interactive dashboard visualization.`,
    ];

    let logIdx = 0;
    const logInterval = setInterval(() => {
      if (logIdx < logMessages.length) {
        setLogs((prev) => [...prev, logMessages[logIdx]]);
        logIdx++;
      }
    }, 700);

    const stageInterval = setInterval(() => {
      setCurrentStage((prev) => (prev < 7 ? prev + 1 : prev));
    }, 1100);

    return () => {
      clearInterval(logInterval);
      clearInterval(stageInterval);
    };
  }, [repoName]);

  const progressPercent = Math.min(100, Math.round((currentStage / 7) * 100));

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="rounded-xl bg-[#0F1116] border border-white/[0.08] p-6 sm:p-7 shadow-2xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-200">
              <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white">Analyzing Codebase</h3>
                <span className="text-[11px] px-2 py-0.2 rounded bg-zinc-800 text-zinc-300 font-mono">
                  {progressPercent}%
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{repoName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-white/[0.06]">
              <span>Elapsed:</span>
              <span className="text-white font-bold">{elapsed}s</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-5">
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 7 Stages Stepper */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {stages.map((stage) => {
            const isCompleted = currentStage > stage.id;
            const isCurrent = currentStage === stage.id;

            return (
              <div
                key={stage.id}
                className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${
                  isCurrent
                    ? 'bg-white/[0.04] border-white/20 text-white'
                    : isCompleted
                    ? 'bg-zinc-900/40 border-white/[0.05] text-zinc-300'
                    : 'bg-zinc-950/40 border-transparent text-zinc-600 opacity-50'
                }`}
              >
                <div className="mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-zinc-300 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-zinc-800 flex items-center justify-center text-[10px] font-mono">
                      {stage.id}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isCurrent ? 'text-white' : isCompleted ? 'text-zinc-200' : 'text-zinc-500'}`}>
                      {stage.label}
                    </span>
                    {isCompleted && (
                      <span className="text-[10px] text-emerald-400 font-mono">Done</span>
                    )}
                    {isCurrent && (
                      <span className="text-[10px] text-zinc-300 font-mono animate-pulse">Running</span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 truncate">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Output Stream */}
        <div className="rounded-lg bg-[#0A0B0E] border border-white/[0.06] p-3.5 font-mono text-xs text-zinc-300">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.05] text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              <span>Pipeline stdout</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Streaming</span>
            </div>
          </div>

          <div className="space-y-1 max-h-28 overflow-y-auto font-mono text-[11px] text-zinc-400 leading-relaxed">
            {logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-zinc-600 select-none">&gt;</span>
                <span className={index === logs.length - 1 ? 'text-zinc-200' : 'text-zinc-500'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rotating Tip */}
        <div className="mt-4 p-2.5 rounded-lg bg-zinc-900/60 border border-white/[0.05] text-center">
          <p className="text-xs text-zinc-400">{tips[tipIndex]}</p>
        </div>
      </div>
    </div>
  );
};
