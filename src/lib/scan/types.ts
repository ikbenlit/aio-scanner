// Scan Engine Types - Gebaseerd op MVP Plan
export interface ModuleResult {
  moduleName: string;
  score: number; // 0-100
  status: 'completed' | 'failed' | 'partial';
  findings: Finding[];
  recommendations: Recommendation[];
  metadata?: Record<string, any>;
}

export interface Finding {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  technicalDetails?: string;
}

export interface Recommendation {
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  implementationSteps: string[];
  estimatedTime: string;
  expectedImpact: string;
  codeSnippet?: string;
}

export interface ScanResult {
  scanId: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  overallScore: number;
  moduleResults: ModuleResult[];
  aiInsights?: AIInsights;
  createdAt: string;
  completedAt?: string;
}

export interface AIInsights {
  topPriorities: string[];
  quickWins: QuickWin[];
  businessImpact: string;
  implementationRoadmap: string[];
}

export interface QuickWin {
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  timeToImplement: string;
}

// Basis interface voor alle scan modules
export interface ScanModule {
  name: string;
  description: string;
  category: 'foundation' | 'ai-enhancement';
  analyze(url: string, html: string, metadata?: ScanMetadata): Promise<ModuleResult>;
  calculateScore(findings: Finding[]): number;
}

export interface ScanMetadata {
  domain: string;
  userAgent: string;
  fetchMethod: 'cheerio' | 'playwright';
  responseTime: number;
  statusCode: number;
} 