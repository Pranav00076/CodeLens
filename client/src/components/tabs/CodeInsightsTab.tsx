import React, { useState } from 'react';
import { ShieldAlert, Bug, Zap, Layers, AlertCircle, FileCode, Check, ExternalLink, Search } from 'lucide-react';
import { CodeIssue } from '../../types/index';
import { DiffViewer } from '../common/DiffViewer';
import { Badge } from '../common/Badge';

interface CodeInsightsTabProps {
  issues: CodeIssue[];
  healthScore: number;
  onSelectFile: (filePath: string, line?: number) => void;
}

export const CodeInsightsTab: React.FC<CodeInsightsTabProps> = ({
  issues,
  healthScore,
  onSelectFile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedIssueId, setExpandedIssueId] = useState<string | null>(issues[0]?.id || null);

  const categories = [
    { id: 'all', label: 'All Issues', count: issues.length },
    { id: 'bug', label: 'Bugs', count: issues.filter(i => i.category === 'bug').length, icon: <Bug className="w-3.5 h-3.5" /> },
    { id: 'security', label: 'Security', count: issues.filter(i => i.category === 'security').length, icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'performance', label: 'Performance', count: issues.filter(i => i.category === 'performance').length, icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'smell', label: 'Code Smells', count: issues.filter(i => i.category === 'smell').length, icon: <AlertCircle className="w-3.5 h-3.5" /> },
    { id: 'complexity', label: 'Complexity', count: issues.filter(i => i.category === 'complexity').length, icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  const filteredIssues = issues.filter(issue => {
    if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
    if (selectedSeverity !== 'all' && issue.severity !== selectedSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        issue.title.toLowerCase().includes(q) ||
        issue.filePath.toLowerCase().includes(q) ||
        issue.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'high': return <Badge variant="rose" size="sm" dot>High</Badge>;
      case 'medium': return <Badge variant="amber" size="sm">Medium</Badge>;
      default: return <Badge variant="slate" size="sm">Low</Badge>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'bug': return <Bug className="w-4 h-4 text-rose-400" />;
      case 'security': return <ShieldAlert className="w-4 h-4 text-amber-400" />;
      case 'performance': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'smell': return <AlertCircle className="w-4 h-4 text-violet-400" />;
      default: return <Layers className="w-4 h-4 text-zinc-400" />;
    }
  };

  return (
    <div className="space-y-5 p-5 sm:p-6 max-w-7xl mx-auto">
      {/* Top Health Audit Banner */}
      <div className="p-5 rounded-xl bg-[#0E1015] border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-zinc-400" />
            <h3 className="text-sm font-semibold text-white">Codebase Health & Static Security Audit</h3>
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Static analysis detecting runtime exceptions, hardcoded production secrets, N+1 query bottlenecks, and complexity hotspots.
          </p>
        </div>

        {/* Health Score Card */}
        <div className="flex items-center gap-4 bg-zinc-900/90 border border-white/[0.06] px-3.5 py-2.5 rounded-xl shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-zinc-500 font-mono">HEALTH SCORE</div>
            <div className={`text-xl font-bold font-mono ${healthScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {healthScore}<span className="text-xs text-zinc-500 font-normal">/100</span>
            </div>
          </div>
          <div className="h-8 w-px bg-white/[0.08]" />
          <div className="space-y-0.5 text-[11px] font-mono">
            <div className="text-rose-400">{issues.filter(i => i.severity === 'high').length} High</div>
            <div className="text-amber-400">{issues.filter(i => i.severity === 'medium').length} Med</div>
            <div className="text-zinc-400">{issues.filter(i => i.severity === 'low').length} Low</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                  : 'bg-zinc-900/80 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-white/[0.05]'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.id ? 'bg-white/20' : 'bg-zinc-800 text-zinc-400'}`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Severity Selector & Search */}
        <div className="flex items-center gap-2">
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0E1015] border border-white/[0.08] rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-white/20 font-sans"
          >
            <option value="all">All Severities</option>
            <option value="high">High Severity Only</option>
            <option value="medium">Medium Severity Only</option>
            <option value="low">Low Severity Only</option>
          </select>

          <div className="relative w-44">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issues..."
              className="w-full pl-8 pr-2.5 py-1.5 bg-[#0E1015] border border-white/[0.08] rounded-lg text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-white/20 font-sans"
            />
          </div>
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length > 0 ? (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const isExpanded = expandedIssueId === issue.id;

            return (
              <div
                key={issue.id}
                className="rounded-xl bg-[#0E1015] border border-white/[0.07] overflow-hidden shadow-sm transition-all"
              >
                {/* Issue Header */}
                <div
                  onClick={() => setExpandedIssueId(isExpanded ? null : issue.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2 rounded-lg bg-zinc-900 border border-white/[0.06] mt-0.5 sm:mt-0">
                      {getCategoryIcon(issue.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-semibold text-white">{issue.title}</h4>
                        {getSeverityBadge(issue.severity)}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-500 font-mono">
                        <FileCode className="w-3 h-3 text-zinc-500" />
                        <span className="text-zinc-300">{issue.filePath}</span>
                        <span>:</span>
                        <span>Lines {issue.lineStart}-{issue.lineEnd}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFile(issue.filePath, issue.lineStart);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-sans border border-white/[0.06] transition-colors"
                    >
                      <span>Open File</span>
                      <ExternalLink className="w-3 h-3 text-zinc-400" />
                    </button>
                    <span className="text-xs text-zinc-500 font-mono">
                      {isExpanded ? 'Collapse ▲' : 'View Fix ▼'}
                    </span>
                  </div>
                </div>

                {/* Expanded Details & Diff */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-white/[0.06] space-y-3.5 animate-in fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.05] space-y-1">
                        <span className="font-semibold text-rose-400 block uppercase tracking-wider text-[10px]">
                          Root Cause & Impact
                        </span>
                        <p className="text-zinc-300 leading-relaxed">{issue.explanation}</p>
                      </div>

                      <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-white/[0.05] space-y-1">
                        <span className="font-semibold text-emerald-400 block uppercase tracking-wider text-[10px]">
                          Remediation Proposal
                        </span>
                        <p className="text-zinc-300 leading-relaxed">{issue.suggestedFix}</p>
                      </div>
                    </div>

                    {/* Diff Viewer */}
                    {issue.diff && (
                      <div className="space-y-1">
                        <span className="text-xs font-medium text-zinc-400">Proposed Code Fix Patch:</span>
                        <DiffViewer diff={issue.diff} filename={issue.filePath} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl bg-zinc-900/40 border border-white/[0.06] space-y-2">
          <Check className="w-6 h-6 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-semibold text-white">No matching issues</h4>
          <p className="text-xs text-zinc-500">Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};
