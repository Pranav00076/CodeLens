import React, { useState, useEffect } from 'react';
import { Key, X, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [currentProvider, setCurrentProvider] = useState<string>('Domain-Aware Heuristic Engine');
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getConfigStatus()
        .then(status => {
          setCurrentProvider(status.provider);
          setHasKey(status.hasKey);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.setApiKey(apiKey);
      setCurrentProvider(res.provider);
      setHasKey(res.hasKey);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-[#0F1116] border border-white/[0.1] rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 animate-in fade-in zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.08] text-white">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">AI Engine Configuration</h3>
              <p className="text-[11px] text-zinc-400">Manage LLM Providers & API Keys</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current status */}
        <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-zinc-400">Active AI Provider:</span>
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            {currentProvider}
          </span>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Google Gemini API Key <span className="text-zinc-400 font-normal">(Optional)</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={hasKey ? '••••••••••••••••••••••••' : 'AIzaSy... (leave empty for smart offline engine)'}
              className="w-full px-3 py-2 rounded-lg bg-[#090A0D] border border-white/[0.08] text-xs font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/30"
            />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              If left blank, CodeLens AI uses its built-in <strong>Domain-Aware Heuristic Engine</strong> which extracts deep semantic architecture and mission from the repository README and code AST.
            </p>
          </div>

          {saved && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AI Provider updated successfully.</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setApiKey('');
                api.setApiKey('').then(res => {
                  setCurrentProvider(res.provider);
                  setHasKey(false);
                });
              }}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium border border-white/[0.06]"
            >
              Reset to Offline Engine
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 font-medium text-xs shadow-sm transition-all active:scale-98"
            >
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Save Key</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
