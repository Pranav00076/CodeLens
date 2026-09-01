import React from 'react';
import { X, Rocket, Download } from 'lucide-react';
import { RepoAnalysis } from '../../types/index';
import { StepJourney } from './StepJourney';
import { api } from '../../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  repo: RepoAnalysis | null;
  onSelectFile: (filePath: string) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  repo,
  onSelectFile,
}) => {
  if (!isOpen || !repo) return null;

  const handleExportMarkdown = () => {
    window.open(api.getExportOnboardingUrl(repo.id), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div
        className="w-full max-w-5xl h-[90vh] bg-[#090A0D] border border-white/[0.1] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0F1116] border-b border-white/[0.07] shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-900 border border-white/10 text-white shadow-sm">
              <Rocket className="w-4 h-4 text-zinc-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-semibold text-white">
                  Developer Onboarding Mode
                </h3>
                <span className="text-xs px-2 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                  {repo.name}
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Interactive step-by-step onboarding journey for fast ramp-up
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/[0.08] text-xs font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export ONBOARDING.md</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <StepJourney
            repo={repo}
            onSelectFile={(f) => {
              onClose();
              onSelectFile(f);
            }}
          />
        </div>
      </div>
    </div>
  );
};
