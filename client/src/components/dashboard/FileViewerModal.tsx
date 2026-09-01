import React, { useState, useEffect } from 'react';
import { X, FileCode, Copy, Check, Loader2 } from 'lucide-react';
import { api } from '../../services/api';

interface FileViewerModalProps {
  repoId: string;
  filePath: string | null;
  highlightLine?: number;
  onClose: () => void;
}

export const FileViewerModal: React.FC<FileViewerModalProps> = ({
  repoId,
  filePath,
  highlightLine,
  onClose,
}) => {
  const [content, setContent] = useState<string>('');
  const [linesCount, setLinesCount] = useState<number>(0);
  const [language, setLanguage] = useState<string>('typescript');
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filePath) return;
    setLoading(true);
    setError(null);

    api.getFileContent(repoId, filePath)
      .then((res) => {
        setContent(res.content);
        setLinesCount(res.lines);
        setLanguage(res.language);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load file content');
        setLoading(false);
      });
  }, [repoId, filePath]);

  if (!filePath) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const lines = content.split('\n');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div
        className="w-full max-w-5xl h-[85vh] bg-[#0A0B0E] border border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0F1116] border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCode className="w-4 h-4 text-zinc-400 shrink-0" />
            <div className="min-w-0">
              <span className="font-mono text-xs font-semibold text-white truncate block">{filePath}</span>
              <span className="text-[11px] text-zinc-500 font-sans">{linesCount} lines • {language.toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-sans transition-colors border border-white/[0.06]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 bg-[#08090C] font-mono text-xs text-zinc-200">
          {loading ? (
            <div className="h-full flex items-center justify-center gap-2 text-zinc-500">
              <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              <span>Loading file contents...</span>
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-rose-400 text-xs">
              {error}
            </div>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isHighlighted = highlightLine && Math.abs(lineNum - highlightLine) <= 2;
                  const isExact = lineNum === highlightLine;

                  return (
                    <tr
                      key={idx}
                      className={`leading-relaxed ${
                        isExact
                          ? 'bg-white/[0.08] border-l-2 border-white'
                          : isHighlighted
                          ? 'bg-white/[0.03]'
                          : 'hover:bg-white/[0.02]'
                      }`}
                    >
                      <td className="select-none pr-4 text-right text-zinc-600 font-mono text-[11px] w-10 align-top">
                        {lineNum}
                      </td>
                      <td className="whitespace-pre font-mono text-zinc-200 pl-2">
                        {line || ' '}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
