import React from 'react';
import { Layers, Bug, Sparkles, MessageSquare, Rocket, Cpu } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: <Rocket className="w-5 h-5 text-zinc-300" />,
      title: 'Developer Onboarding Journey',
      description: 'Generates a 7-step interactive onboarding roadmap covering mission, local dev commands, essential starter files, and comprehension quizzes.',
      badge: 'Interactive Flow',
    },
    {
      icon: <Layers className="w-5 h-5 text-zinc-300" />,
      title: 'Visual Architecture Map',
      description: 'Visualizes microservices, API routes, controller boundaries, database entities, and external gateways in an interactive component graph.',
      badge: 'Topology',
    },
    {
      icon: <Bug className="w-5 h-5 text-zinc-300" />,
      title: 'Code Smells & Diff Fixes',
      description: 'Audits potential runtime bugs, security vulnerabilities (hardcoded secrets, XSS vectors), and N+1 query bottlenecks with unified diff patches.',
      badge: 'Audit',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-zinc-300" />,
      title: 'Automated Unit Test Generator',
      description: 'Select any file or function to generate full test suites with Jest or Vitest, covering happy paths, edge cases, and mocked error states.',
      badge: 'Testing',
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-zinc-300" />,
      title: 'Repository-Grounded AI Chat',
      description: 'Ask deep technical questions about how auth works, where an API lives, or how to add a feature. Every answer comes with clickable file citations.',
      badge: 'Context Q&A',
    },
    {
      icon: <Cpu className="w-5 h-5 text-zinc-300" />,
      title: 'Multi-LLM Engine & Demo Mode',
      description: 'Configurable AI layer supporting Google Gemini, OpenAI, or smart deterministic offline engine so demonstrations never stall or fail.',
      badge: 'Zero-Latency',
    },
  ];

  return (
    <section className="py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight font-sans">
          Engineered for fast comprehension
        </h2>
        <p className="mt-2 text-zinc-400 text-xs sm:text-sm">
          Everything you need to navigate and contribute to an unfamiliar codebase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, idx) => (
          <div
            key={idx}
            className="p-5 rounded-xl bg-[#0F1116] border border-white/[0.07] hover:border-white/[0.15] transition-all duration-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.06]">
                  {feature.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-white/[0.05]">
                  {feature.badge}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{feature.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
