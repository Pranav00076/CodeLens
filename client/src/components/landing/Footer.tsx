import React from 'react';
import { Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-[#07080A] py-10 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-zinc-900 border border-white/10 text-zinc-300">
            <Code2 className="w-3.5 h-3.5" />
          </div>
          <span className="font-medium text-zinc-300">CodeLens AI</span>
          <span className="text-zinc-600">•</span>
          <span className="text-zinc-500">Understand any codebase in minutes</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-mono">
          <span>React • TypeScript • Express • Gemini</span>
        </div>
      </div>
    </footer>
  );
};
