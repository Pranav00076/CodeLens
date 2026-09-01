import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

interface LivePreviewDemoProps {
  onLoadDemo: () => void;
}

export const LivePreviewDemo: React.FC<LivePreviewDemoProps> = ({ onLoadDemo }) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'arch' | 'diff' | 'onboarding'>('arch');

  return (
    <section className="py-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-xl border border-white/[0.08] bg-[#0E1015] overflow-hidden shadow-2xl">
        {/* Fake window title bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#12141A] border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 inline-block" />
            </div>
            <span className="ml-3 text-xs font-mono text-zinc-400">Dashboard Preview — ShopSphere Microservices</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded-md border border-white/[0.06] text-xs">
            <button
              onClick={() => setActivePreviewTab('arch')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activePreviewTab === 'arch' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Architecture Map
            </button>
            <button
              onClick={() => setActivePreviewTab('diff')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activePreviewTab === 'diff' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bug Smell & Diff
            </button>
            <button
              onClick={() => setActivePreviewTab('onboarding')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                activePreviewTab === 'onboarding' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              🚀 Onboarding
            </button>
          </div>

          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1 text-xs font-medium text-zinc-300 hover:text-white font-sans"
          >
            <span>Launch Demo</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Window Content */}
        <div className="p-5">
          {activePreviewTab === 'arch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">System Architecture Topology</h4>
                  <p className="text-xs text-zinc-400">Microservices pattern with decoupled API Gateway and Postgres/Redis</p>
                </div>
                <Badge variant="slate">Microservices</Badge>
              </div>

              {/* Node simulation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-200">Web Storefront</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">React 18</span>
                  </div>
                  <p className="text-xs text-zinc-400">Catalogue & cart client state. Proxied via Gateway.</p>
                  <div className="mt-2 text-[10px] font-mono text-zinc-500">apps/web/src/App.tsx</div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-200">API Gateway & Auth</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">Express / JWT</span>
                  </div>
                  <p className="text-xs text-zinc-400">Reverse proxy, rate limiting, and JWT token claims.</p>
                  <div className="mt-2 text-[10px] font-mono text-zinc-500">services/api-gateway/src/index.ts</div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.06]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-zinc-200">Postgres & Redis</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">Prisma ORM</span>
                  </div>
                  <p className="text-xs text-zinc-400">Relational store for orders, items, and pub/sub events.</p>
                  <div className="mt-2 text-[10px] font-mono text-zinc-500">packages/database/prisma/schema.prisma</div>
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'diff' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold font-mono">HIGH</span>
                  <h4 className="text-xs font-semibold text-white">Hardcoded Default JWT Secret in Auth Middleware</h4>
                </div>
                <span className="text-xs font-mono text-zinc-500">services/api-gateway/src/middleware/auth.ts:L4</span>
              </div>

              <div className="rounded-lg overflow-hidden bg-[#090A0D] border border-white/[0.06] p-3 font-mono text-xs text-zinc-300 leading-relaxed">
                <div className="text-zinc-500 italic text-[11px] mb-2">Suggested Unified Fix Diff:</div>
                <div className="bg-rose-500/[0.08] text-rose-300 border-l-2 border-rose-500 px-2 py-0.5">
                  - const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-default-key-12345';
                </div>
                <div className="bg-emerald-500/[0.08] text-emerald-300 border-l-2 border-emerald-500 px-2 py-0.5 mt-1">
                  + if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') &#123;<br />
                  + &nbsp;&nbsp;throw new Error('FATAL: JWT_SECRET must be set in production');<br />
                  + &#125;<br />
                  + const JWT_SECRET = process.env.JWT_SECRET || 'dev_only_secret';
                </div>
              </div>
            </div>
          )}

          {activePreviewTab === 'onboarding' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Step-by-Step Developer Journey</h4>
                <span className="text-xs text-zinc-400 font-mono">Step 2 of 7</span>
              </div>

              <div className="p-4 rounded-lg bg-zinc-900/80 border border-white/[0.06] space-y-2">
                <div className="flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Start DB & Redis Infrastructure</span>
                </div>
                <div className="p-2 rounded-md bg-[#090A0D] font-mono text-xs text-zinc-200 flex items-center justify-between border border-white/[0.05]">
                  <code>docker-compose up -d && npm run dev</code>
                  <span className="text-[10px] text-zinc-500">Copy</span>
                </div>
                <p className="text-xs text-zinc-400">Spins up PostgreSQL container on port 5432 and Redis on 6379, then launches services.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
