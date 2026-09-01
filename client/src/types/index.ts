export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  size?: number;
  lines?: number;
  language?: string;
  summary?: string;
  children?: FileTreeNode[];
}

export interface TechLanguage {
  name: string;
  percentage: number;
  fileCount: number;
  color: string;
}

export interface TechFramework {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'orm' | 'testing' | 'devops' | 'styling' | 'utility';
  description?: string;
}

export interface EntryPoint {
  path: string;
  type: 'web_entry' | 'api_entry' | 'cli_entry' | 'worker' | 'config';
  description: string;
}

export interface ArchitectureDiagramNode {
  id: string;
  label: string;
  type: 'frontend' | 'api' | 'service' | 'database' | 'external' | 'config' | 'worker';
  description: string;
  files: string[];
  tech?: string;
}

export interface ArchitectureDiagramEdge {
  from: string;
  to: string;
  label: string;
  flowType?: 'data' | 'call' | 'event';
}

export interface ArchitectureLayer {
  name: string;
  purpose: string;
  files: string[];
}

export interface ArchitectureInfo {
  pattern: string;
  overview: string;
  dataFlow: string;
  layers: ArchitectureLayer[];
  diagramNodes: ArchitectureDiagramNode[];
  diagramEdges: ArchitectureDiagramEdge[];
}

export interface CodeIssue {
  id: string;
  title: string;
  category: 'bug' | 'security' | 'performance' | 'smell' | 'complexity';
  severity: 'high' | 'medium' | 'low';
  filePath: string;
  lineStart: number;
  lineEnd: number;
  snippet: string;
  explanation: string;
  suggestedFix: string;
  diff: string;
}

export interface StarterFile {
  path: string;
  rank: number;
  reasonToRead: string;
  keyConcepts: string[];
}

export interface ExecutionFlowStep {
  step: number;
  title: string;
  trigger: string;
  trace: string[];
  description: string;
}

export interface LearningPathMilestone {
  day: string;
  milestone: string;
  tasks: string[];
  filesToExplore: string[];
}

export interface OnboardingQuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface OnboardingGuide {
  mission: string;
  quickStart: {
    prerequisites: string[];
    envVars: Array<{ key: string; example: string; required: boolean; description: string }>;
    commands: Array<{ label: string; command: string; description: string }>;
  };
  techStackRationale: Array<{ tech: string; role: string; reason: string }>;
  architectureWalkthrough: string;
  starterFiles: StarterFile[];
  executionFlow: ExecutionFlowStep[];
  learningPath: LearningPathMilestone[];
  quiz: OnboardingQuizQuestion[];
}

export interface RepoStats {
  totalFiles: number;
  totalLines: number;
  totalSizeKB: number;
  languageCounts: Record<string, number>;
  frameworkCounts: Record<string, number>;
  healthScore: number;
}

export interface RepoAnalysis {
  id: string;
  name: string;
  source: 'github' | 'upload' | 'demo';
  url?: string;
  branch?: string;
  analyzedAt: string;
  summary: string;
  stats: RepoStats;
  languages: TechLanguage[];
  frameworks: TechFramework[];
  entryPoints: EntryPoint[];
  architecture: ArchitectureInfo;
  fileTree: FileTreeNode;
  issues: CodeIssue[];
  onboardingGuide: OnboardingGuide;
}

export interface Citation {
  filePath: string;
  line?: number;
  snippet?: string;
  label?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
}

export interface GeneratedTest {
  id: string;
  targetFile: string;
  targetFunction?: string;
  framework: string;
  rationale: string;
  edgeCases: string[];
  expectedOutputs: string[];
  code: string;
}

export type TabType = 'overview' | 'insights' | 'tests' | 'chat';
