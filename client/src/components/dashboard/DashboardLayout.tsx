import React, { useState } from 'react';
import { RepoAnalysis, TabType } from '../../types/index';
import { LeftSidebar } from './LeftSidebar';
import { TabsNavigation } from './TabsNavigation';
import { OverviewTab } from '../tabs/OverviewTab';
import { CodeInsightsTab } from '../tabs/CodeInsightsTab';
import { TestGeneratorTab } from '../tabs/TestGeneratorTab';
import { AskCodeLensTab } from '../tabs/AskCodeLensTab';
import { FileViewerModal } from './FileViewerModal';
import { OnboardingModal } from '../onboarding/OnboardingModal';

interface DashboardLayoutProps {
  repo: RepoAnalysis;
  onOpenOnboarding: () => void;
  isOnboardingOpen: boolean;
  onCloseOnboarding: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  repo,
  onOpenOnboarding,
  isOnboardingOpen,
  onCloseOnboarding,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [highlightLine, setHighlightLine] = useState<number | undefined>(undefined);

  const handleSelectFile = (filePath: string, line?: number) => {
    setViewingFile(filePath);
    setHighlightLine(line);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row min-h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Sidebar */}
      <LeftSidebar
        repo={repo}
        selectedFile={viewingFile}
        onSelectFile={handleSelectFile}
        onOpenOnboarding={onOpenOnboarding}
      />

      {/* Main Tab Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0B0F17] overflow-y-auto">
        <TabsNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          issuesCount={repo.issues.length}
        />

        <div className="flex-1 overflow-y-auto pb-12">
          {activeTab === 'overview' && (
            <OverviewTab
              repo={repo}
              onSelectFile={handleSelectFile}
              onOpenOnboarding={onOpenOnboarding}
            />
          )}

          {activeTab === 'insights' && (
            <CodeInsightsTab
              issues={repo.issues}
              healthScore={repo.stats.healthScore}
              onSelectFile={handleSelectFile}
            />
          )}

          {activeTab === 'tests' && (
            <TestGeneratorTab
              repo={repo}
              onSelectFile={handleSelectFile}
            />
          )}

          {activeTab === 'chat' && (
            <AskCodeLensTab
              repo={repo}
              onSelectFile={handleSelectFile}
            />
          )}
        </div>
      </main>

      {/* Full File Code Viewer Modal */}
      <FileViewerModal
        repoId={repo.id}
        filePath={viewingFile}
        highlightLine={highlightLine}
        onClose={() => {
          setViewingFile(null);
          setHighlightLine(undefined);
        }}
      />

      {/* Onboarding Mode Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={onCloseOnboarding}
        repo={repo}
        onSelectFile={handleSelectFile}
      />
    </div>
  );
};
