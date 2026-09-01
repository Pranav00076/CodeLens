import React, { useState, useEffect } from 'react';
import { RepoAnalysis, TabType } from './types/index';
import { api } from './services/api';
import { Navbar } from './components/common/Navbar';
import { CommandPalette } from './components/common/CommandPalette';
import { HeroSection } from './components/landing/HeroSection';
import { AnalyzeInputCard } from './components/landing/AnalyzeInputCard';
import { FeatureGrid } from './components/landing/FeatureGrid';
import { LivePreviewDemo } from './components/landing/LivePreviewDemo';
import { Footer } from './components/landing/Footer';
import { LoadingPipeline } from './components/analyze/LoadingPipeline';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

export function App() {
  const [currentRepo, setCurrentRepo] = useState<RepoAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisName, setAnalysisName] = useState<string>('Repository');
  const [analysisSource, setAnalysisSource] = useState<'github' | 'upload' | 'demo'>('github');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAnalyzeGithub = async (url: string) => {
    setIsAnalyzing(true);
    setAnalysisName(url.replace(/^https?:\/\/github\.com\//, ''));
    setAnalysisSource('github');
    setErrorMessage(null);

    try {
      const result = await api.analyzeGithub(url);
      // Wait slight buffer so users see the sleek loading animation
      setTimeout(() => {
        setCurrentRepo(result);
        setIsAnalyzing(false);
      }, 1500);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Failed to analyze repository. Please verify the URL.');
    }
  };

  const handleAnalyzeZip = async (file: File) => {
    setIsAnalyzing(true);
    setAnalysisName(file.name);
    setAnalysisSource('upload');
    setErrorMessage(null);

    try {
      const result = await api.analyzeZip(file);
      setTimeout(() => {
        setCurrentRepo(result);
        setIsAnalyzing(false);
      }, 1500);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Failed to analyze archive.');
    }
  };

  const handleLoadDemo = async () => {
    setIsAnalyzing(true);
    setAnalysisName('ShopSphere / CloudPulse-ECommerce');
    setAnalysisSource('demo');
    setErrorMessage(null);

    try {
      const demo = await api.getDemo();
      setTimeout(() => {
        setCurrentRepo(demo);
        setIsAnalyzing(false);
      }, 1200);
    } catch (err: any) {
      setIsAnalyzing(false);
      setErrorMessage(err.message || 'Failed to load demo.');
    }
  };

  const scrollToInput = () => {
    document.getElementById('analyze-card-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0F17] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        currentRepo={currentRepo}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onNewAnalysis={() => setCurrentRepo(null)}
        onLoadDemo={handleLoadDemo}
        isLoadingDemo={isAnalyzing && analysisSource === 'demo'}
      />

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        currentRepo={currentRepo}
        onSelectTab={() => {}}
        onSelectFile={() => {}}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main View Router */}
      {isAnalyzing ? (
        /* Loading Pipeline View */
        <div className="flex-1 flex items-center justify-center p-4">
          <LoadingPipeline
            repoName={analysisName}
            sourceType={analysisSource}
          />
        </div>
      ) : currentRepo ? (
        /* Dashboard View */
        <DashboardLayout
          repo={currentRepo}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          isOnboardingOpen={isOnboardingOpen}
          onCloseOnboarding={() => setIsOnboardingOpen(false)}
        />
      ) : (
        /* Landing Page View */
        <div className="flex-1 flex flex-col">
          {errorMessage && (
            <div className="max-w-3xl mx-auto mt-4 px-4 w-full">
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage(null)} className="text-rose-400 font-bold ml-2">✕</button>
              </div>
            </div>
          )}

          <HeroSection
            onAnalyzeClick={scrollToInput}
            onLoadDemo={handleLoadDemo}
            isLoadingDemo={isAnalyzing && analysisSource === 'demo'}
          />

          <div id="analyze-card-section" className="py-4">
            <AnalyzeInputCard
              onAnalyzeGithub={handleAnalyzeGithub}
              onAnalyzeZip={handleAnalyzeZip}
              isLoading={isAnalyzing}
            />
          </div>

          <FeatureGrid />

          <LivePreviewDemo onLoadDemo={handleLoadDemo} />

          <Footer />
        </div>
      )}
    </div>
  );
}

export default App;
