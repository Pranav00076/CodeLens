import React, { useState } from 'react';
import { Check, Copy, GitCompare } from 'lucide-react';

interface DiffViewerProps {
  diff: string;
  filename?: string;
  className?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  diff,
  filename,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(diff);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy diff:', err);
    }
  };

  const lines = diff.split('\n');

  return (
    <div className={`rounded-xl overflow-hidden border border-white/[0.08] bg-[#0A0B0E] text-xs font-mono shadow-md ${className}`}>
      <div className="flex items-center justify-between px-3.5 py-2 bg-[#101217] border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-zinc-400">
          <GitCompare className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-sans font-medium text-zinc-300">
            {filename || 'Suggested Unified Diff'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-[11px] border border-white/5"
          title="Copy Diff Patch"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied Patch</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="font-sans">Copy Patch</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3 overflow-x-auto max-h-[350px] leading-relaxed">
        {lines.map((line, index) => {
          let lineStyle = 'text-zinc-400';
          let bgStyle = 'hover:bg-white/[0.02]';

          if (line.startsWith('+') && !line.startsWith('+++')) {
            lineStyle = 'text-emerald-300 font-medium';
            bgStyle = 'bg-emerald-500/[0.08] border-l-2 border-emerald-500 pl-1.5';
          } else if (line.startsWith('-') && !line.startsWith('---')) {
            lineStyle = 'text-rose-300 font-medium';
            bgStyle = 'bg-rose-500/[0.08] border-l-2 border-rose-500 pl-1.5';
          } else if (line.startsWith('@@')) {
            lineStyle = 'text-zinc-400 font-semibold bg-white/[0.04] px-1.5 py-0.5 rounded my-1 block';
            bgStyle = '';
          } else if (line.startsWith('---') || line.startsWith('+++')) {
            lineStyle = 'text-zinc-500 italic';
          }

          return (
            <div key={index} className={`flex items-start gap-2 py-0.5 px-1.5 ${bgStyle}`}>
              <span className="select-none text-zinc-600 w-5 text-right font-mono text-[10px]">
                {index + 1}
              </span>
              <span className={`whitespace-pre flex-1 font-mono ${lineStyle}`}>
                {line || ' '}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
