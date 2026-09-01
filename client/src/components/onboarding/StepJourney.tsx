import React, { useState } from 'react';
import { Rocket, Terminal, CheckCircle2, Copy, Check, FileCode, Layers, ArrowRight, ArrowLeft, BookOpen, Cpu } from 'lucide-react';
import { OnboardingGuide, RepoAnalysis } from '../../types/index';
import { OnboardingQuiz } from './OnboardingQuiz';

interface StepJourneyProps {
  repo: RepoAnalysis;
  onSelectFile: (filePath: string) => void;
}

export const StepJourney: React.FC<StepJourneyProps> = ({
  repo,
  onSelectFile,
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const guide = repo.onboardingGuide;

  const steps = [
    { id: 1, title: 'Project Mission', subtitle: 'What this project does' },
    { id: 2, title: 'Run Locally', subtitle: 'Prerequisites, env & commands' },
    { id: 3, title: 'Tech Stack', subtitle: 'Dependencies & rationale' },
    { id: 4, title: 'Architecture Flow', subtitle: 'Component mental model' },
    { id: 5, title: 'Starter Files', subtitle: 'Top 5 files to read first' },
    { id: 6, title: 'Execution Lifecycle', subtitle: 'End-to-end request trace' },
    { id: 7, title: 'Learning Roadmap', subtitle: '7-day path & quiz' },
  ];

  const handleCopyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 min-h-[550px]">
      {/* Left Stepper Sidebar */}
      <div className="w-full lg:w-60 bg-[#0E1015] border border-white/[0.07] rounded-xl p-3 space-y-1 shrink-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-1 mb-1">
          Onboarding Steps
        </div>

        {steps.map((step) => {
          const isCurrent = activeStep === step.id;
          const isDone = activeStep > step.id;

          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left transition-all ${
                isCurrent
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                  : isDone
                  ? 'text-zinc-300 hover:bg-white/[0.03]'
                  : 'text-zinc-500 hover:bg-white/[0.02]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 mt-0.5 ${
                  isCurrent
                    ? 'bg-white text-zinc-950'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-zinc-850 text-zinc-500'
                }`}
              >
                {isDone ? '✓' : step.id}
              </div>

              <div className="min-w-0">
                <div className={`text-xs font-medium truncate ${isCurrent ? 'text-white' : 'text-zinc-300'}`}>
                  {step.title}
                </div>
                <div className="text-[10px] text-zinc-500 truncate">{step.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Step Content */}
      <div className="flex-1 bg-[#0E1015] border border-white/[0.07] rounded-xl p-5 sm:p-7 flex flex-col justify-between shadow-xl">
        <div className="space-y-5">
          {/* Step 1: Mission */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                <Rocket className="w-3.5 h-3.5" />
                <span>Step 1: Project Mission & Problem Solved</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                What does <span className="text-zinc-300">{repo.name}</span> do?
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed p-4 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                {guide.mission}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-0.5">ARCHITECTURE PATTERN</span>
                  <span className="text-xs font-semibold text-zinc-200">{repo.architecture.pattern}</span>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-0.5">CODEBASE SIZE</span>
                  <span className="text-xs font-semibold text-zinc-200">{repo.stats.totalLines.toLocaleString()} Lines ({repo.stats.totalFiles} files)</span>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-white/[0.05]">
                  <span className="text-[10px] text-zinc-500 font-mono block mb-0.5">HEALTH SCORE</span>
                  <span className="text-xs font-semibold text-emerald-400">{repo.stats.healthScore} / 100</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: How to Run Locally */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Step 2: Local Development Setup & Quick Start</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                Running locally on your machine
              </h3>

              {/* Prerequisites */}
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-zinc-400">Prerequisites</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {guide.quickStart.prerequisites.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-900/80 border border-white/[0.05] text-xs text-zinc-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment Variables Table */}
              {guide.quickStart.envVars.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-zinc-400">Environment Variables (.env)</span>
                  <div className="overflow-x-auto rounded-lg border border-white/[0.06] bg-[#090A0D]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-900 text-zinc-400 border-b border-white/[0.06]">
                        <tr>
                          <th className="p-2.5 font-medium">Variable</th>
                          <th className="p-2.5 font-medium">Status</th>
                          <th className="p-2.5 font-medium">Example</th>
                          <th className="p-2.5 font-medium">Purpose</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.05] text-zinc-300">
                        {guide.quickStart.envVars.map((env, idx) => (
                          <tr key={idx} className="hover:bg-white/[0.02]">
                            <td className="p-2.5 font-mono text-zinc-200 font-semibold">{env.key}</td>
                            <td className="p-2.5">
                              {env.required ? (
                                <span className="px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-300 font-mono text-[10px]">Required</span>
                              ) : (
                                <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px]">Optional</span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono text-zinc-500">{env.example}</td>
                            <td className="p-2.5 text-zinc-400">{env.description}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step Commands */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-zinc-400">Execution Commands</span>
                {guide.quickStart.commands.map((cmd, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.05] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-200">{cmd.label}</span>
                      <span className="text-zinc-500 text-[11px]">{cmd.description}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-md bg-[#090A0D] font-mono text-xs text-zinc-200 border border-white/[0.05]">
                      <code>{cmd.command}</code>
                      <button
                        onClick={() => handleCopyText(cmd.command, `cmd-${idx}`)}
                        className="p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                        title="Copy command"
                      >
                        {copiedKey === `cmd-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Tech Stack */}
          {activeStep === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5" />
                <span>Step 3: Tech Stack & Rationale</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                Why were these technologies chosen?
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.techStackRationale.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-xs text-zinc-100">{t.tech}</h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                        {t.role}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{t.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Architecture */}
          {activeStep === 4 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5" />
                <span>Step 4: Architecture & Blueprint</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                System Blueprint & Data Flow
              </h3>

              <div className="p-4 rounded-xl bg-zinc-900/80 border border-white/[0.06] space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Overview</h4>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {guide.architectureWalkthrough}
                </p>
                <div className="pt-2 border-t border-white/[0.06]">
                  <span className="text-[10px] font-mono text-zinc-500 block mb-0.5">REQUEST PIPELINE:</span>
                  <p className="text-xs text-zinc-400">{repo.architecture.dataFlow}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Starter Files */}
          {activeStep === 5 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                <FileCode className="w-3.5 h-3.5" />
                <span>Step 5: Top 5 Essential Files</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                Read these files to understand the codebase
              </h3>

              <div className="space-y-2.5">
                {guide.starterFiles.map((sf, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-1.5 hover:border-white/[0.15] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-mono font-semibold">
                          #{sf.rank}
                        </span>
                        <span className="font-mono text-xs font-semibold text-zinc-200">{sf.path}</span>
                      </div>

                      <button
                        onClick={() => onSelectFile(sf.path)}
                        className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-sans transition-colors border border-white/[0.05]"
                      >
                        Inspect
                      </button>
                    </div>

                    <p className="text-xs text-zinc-400">{sf.reasonToRead}</p>

                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {sf.keyConcepts.map((kc, kIdx) => (
                        <span key={kIdx} className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-500 font-sans">
                          {kc}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Execution Flow */}
          {activeStep === 6 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Step 6: End-to-End Application Lifecycle</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                Tracing requests from start to finish
              </h3>

              <div className="space-y-2.5">
                {guide.executionFlow.map((step) => (
                  <div
                    key={step.step}
                    className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400">
                          Step {step.step}
                        </span>
                        <h4 className="text-xs font-semibold text-white">{step.title}</h4>
                      </div>
                      <span className="text-[10px] text-zinc-500">{step.trigger}</span>
                    </div>

                    <p className="text-xs text-zinc-400">{step.description}</p>

                    <div className="p-2 rounded-md bg-[#090A0D] font-mono text-[11px] text-zinc-300 flex items-center gap-1.5 overflow-x-auto border border-white/[0.04]">
                      <span className="text-zinc-600">Trace:</span>
                      {step.trace.map((t, tIdx) => (
                        <span key={tIdx} className="whitespace-nowrap">
                          {t} {tIdx < step.trace.length - 1 && '➔'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 7: 7-Day Roadmap & Quiz */}
          {activeStep === 7 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Step 7: Contribution Roadmap & Quiz</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-semibold text-white leading-tight">
                7-day path to shipping production code
              </h3>

              {/* Milestones */}
              <div className="space-y-2.5">
                {guide.learningPath.map((milestone, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-zinc-200">{milestone.day}</h4>
                      <span className="text-[11px] text-zinc-500 font-medium">{milestone.milestone}</span>
                    </div>

                    <ul className="text-xs text-zinc-400 space-y-1">
                      {milestone.tasks.map((task, tIdx) => (
                        <li key={tIdx} className="flex items-start gap-2">
                          <span className="text-emerald-400">✓</span>
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>

                    {milestone.filesToExplore.length > 0 && (
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 pt-0.5">
                        <span>Explore:</span>
                        {milestone.filesToExplore.map((f, fIdx) => (
                          <span key={fIdx} className="text-zinc-300 underline cursor-pointer" onClick={() => onSelectFile(f)}>
                            {f}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quiz section */}
              {guide.quiz.length > 0 && (
                <div className="pt-3 border-t border-white/[0.06]">
                  <OnboardingQuiz questions={guide.quiz} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between pt-5 border-t border-white/[0.06] mt-5">
          <button
            onClick={() => setActiveStep(prev => Math.max(1, prev - 1))}
            disabled={activeStep === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-medium border border-white/[0.06] disabled:opacity-30 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <span className="text-xs text-zinc-500 font-mono">
            {activeStep} of 7
          </span>

          <button
            onClick={() => setActiveStep(prev => Math.min(7, prev + 1))}
            disabled={activeStep === 7}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-medium disabled:opacity-30 shadow-sm transition-all active:scale-95"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
