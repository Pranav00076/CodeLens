import React from 'react';
import { Layers, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { TabType } from '../../types/index';

interface TabsNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  issuesCount: number;
}

export const TabsNavigation: React.FC<TabsNavigationProps> = ({
  activeTab,
  onTabChange,
  issuesCount,
}) => {
  const tabs = [
    {
      id: 'overview' as TabType,
      label: 'Overview & Architecture',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'insights' as TabType,
      label: 'Code Insights',
      icon: <ShieldAlert className="w-4 h-4" />,
      badge: issuesCount > 0 ? issuesCount : undefined,
      badgeColor: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    },
    {
      id: 'tests' as TabType,
      label: 'Test Generator',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'chat' as TabType,
      label: 'Ask CodeLens',
      icon: <MessageSquare className="w-4 h-4" />,
    },
  ];

  return (
    <div className="border-b border-white/[0.07] bg-[#0A0B0E] px-4 sm:px-6">
      <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs sm:text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              <span className={isActive ? 'text-white' : 'text-zinc-500'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
