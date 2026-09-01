import { ChatMessage, Citation, GeneratedTest, ArchitectureInfo, CodeIssue, OnboardingGuide, TechLanguage, TechFramework, EntryPoint } from '../types/index.js';
import { DomainMetadata } from '../services/domainParserService.js';

export { ChatMessage };

export interface RepoAIContext {
  repoName: string;
  languages: TechLanguage[];
  frameworks: TechFramework[];
  entryPoints: EntryPoint[];
  fileOutline: string;
  keyFiles: Array<{ path: string; sampleContent?: string; language?: string; lines: number }>;
  domainMeta?: DomainMetadata;
}

export interface AIAnalysisResult {
  summary: string;
  architecture: ArchitectureInfo;
  issues: CodeIssue[];
  onboardingGuide: OnboardingGuide;
}

export interface IAIProvider {
  name: string;
  isAvailable(): boolean;
  analyzeCodebase(context: RepoAIContext): Promise<AIAnalysisResult>;
  answerQuestion(context: RepoAIContext, history: ChatMessage[], question: string): Promise<{ answer: string; citations: Citation[] }>;
  generateTests(context: RepoAIContext, targetFile: string, fileContent: string, targetFunction?: string, framework?: string): Promise<GeneratedTest>;
}
