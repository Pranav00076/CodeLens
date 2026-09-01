import React, { useState } from 'react';
import { Check, Copy, FileCode } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
  maxHeight = '400px',
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className={`rounded-xl overflow-hidden border border-white/[0.08] bg-[#0C0D11] text-zinc-200 font-mono text-xs shadow-lg ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#12141A] border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-zinc-400">
          <FileCode className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-sans font-medium text-zinc-300">
            {filename || language.toUpperCase()}
          </span>
          <span className="text-[11px] text-zinc-500 font-sans">({lines.length} lines)</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all text-xs border border-white/5"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 font-sans">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code contents with line numbers */}
      <div
        className="overflow-x-auto overflow-y-auto p-4 leading-relaxed"
        style={{ maxHeight }}
      >
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                {showLineNumbers && (
                  <td className="select-none pr-4 text-right text-zinc-600 font-mono text-[11px] w-8 align-top">
                    {idx + 1}
                  </td>
                )}
                <td className="whitespace-pre font-mono text-zinc-200 pl-2">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
