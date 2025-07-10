// src/lib/types/scan.ts
import type { Database } from '../supabase';
import type { ScanTier } from '../types/database';
import type { MissedOpportunity, AuthorityEnhancement, CitabilityImprovement } from '../scan/LLMEnhancementService';

// Re-export ScanTier for convenience
export type { ScanTier } from '../types/database';

// Database row types - extended with new columns from Phase 1
// TODO: Add these columns to the actual database schema
export type DBScan = Database['public']['Tables']['scans']['Row'] & {
	tier: ScanTier;
	payment_reference: string | null;
	user_email: string | null;
	page_title?: string | null;
	ai_report?: any;
	error?: any;
	ai_insights?: any;
	narrative_report?: any;
	cost_tracking?: any;
	// Phase 3.5 - PDF Tracking
	pdf_generation_status?: 'pending' | 'generating' | 'completed' | 'failed';
	last_pdf_generated_at?: string | null;
	pdf_template_version?: string | null;
	pdf_url?: string | null;
};
export type DBModuleResult = {
    scan_id: string;
    module_name: string;
    status: 'waiting' | 'running' | 'completed' | 'failed';
    score: number;
    findings: Finding[];
    progress: number;
    completed_at: string | null;
};

// Shared types voor scan resultaten
export interface Finding {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    recommendation?: string;
    impact?: string;
    category?: string;
    technicalDetails?: string;
    estimatedTime?: string;
    // Phase 1.2: Smart Analysis - Evidence and suggestions for contextual findings
    evidence?: string[];  // Max 3 contextual quotes/examples
    suggestion?: string;  // Concrete, actionable suggestion
    // MVP Enhancement: Add metrics field for business intelligence
    metrics?: {
        score?: number;
        benchmark?: string;
        breakdown?: Record<string, any>;
        details?: Record<string, any>;
        [key: string]: any;
    };
}

export interface ModuleResult {
    name: string;
    score: number;
    findings: Finding[];
    status?: 'waiting' | 'running' | 'completed' | 'failed';
    progress?: number;
    completedAt?: string;
}

// AI Report interface - moved here for central access
export interface AIReport {
    summary: string;
    recommendations: Finding[];
    implementationPlan?: {
        steps: string[];
        estimatedTime: string;
    };
    estimatedImpact: string;
}

export interface BaseScanResult {
    scanId: string;
    url: string;
    pageTitle?: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    overallScore: number;
    createdAt: string;
    completedAt?: string;
}

// Voor de scan engine - main interface
export interface EngineScanResult extends BaseScanResult {
    moduleResults: ModuleResult[];
    tier: ScanTier;
    aiReport?: AIReport;
    error?: string;
    // Phase 3 - Business Tier
    aiInsights?: AIInsights;
    narrativeReport?: NarrativeReport;
    costTracking?: {
        aiCost: number;
        scanDuration: number;
        fallbackUsed?: boolean;
        enterpriseFeatures?: {
            multiPageAnalysis: number;
            competitiveInsights: boolean;
            strategicRoadmap: boolean;
        };
    };
    pdfUrl?: string | null;
    // Enterprise Tier
    enterpriseFeatures?: EnterpriseFeatures;
}

// Voor email templates - simplified interface
export interface EmailScanResult extends BaseScanResult {
    moduleResults: {
        name: string; // Display name for emails
        score: number;
        findings: Finding[];
    }[];
    tier?: ScanTier;
    quickWins?: QuickWin[];
    // Phase 3.5 - PDF Template Support
    aiNarrative?: {
        executiveSummary: string;
        detailedAnalysis: string;
        implementationRoadmap: string;
        conclusionNextSteps: string;
    };
    includeRecommendations?: boolean;
    enhancedInsights?: boolean;
}

// Phase 3.5 - PDF Generation Options
export interface PDFGenerationOptions {
    tier: ScanTier;
    narrativeContent?: NarrativeReport;
    format?: 'A4' | 'Letter';
    margin?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

// Quick wins voor email templates
export interface QuickWin {
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    implementation: string;
    estimatedTime?: string;
}

// Tier-specific result extensions
export interface StarterScanResult extends EngineScanResult {
    tier: 'starter';
    aiReport: AIReport;
    pdfUrl?: string;
}

export interface BusinessScanResult extends EngineScanResult {
    tier: 'business';
    aiReport: AIReport;
    llmInsights?: any;
    pdfUrl?: string;
}

// Helper functie voor conversie naar email format
export function convertToEmailFormat(scanResult: EngineScanResult): EmailScanResult {
    return {
        ...scanResult,
        moduleResults: scanResult.moduleResults.map(module => ({
            name: module.name,
            score: module.score,
            findings: module.findings
        })),
        quickWins: scanResult.aiReport ? convertToQuickWins(scanResult.aiReport) : undefined
    };
}

// Helper: Convert AI recommendations to quick wins for email
export function convertToQuickWins(aiReport: AIReport): QuickWin[] {
    return aiReport.recommendations
        .filter(rec => rec.priority === 'high')
        .slice(0, 3) // Top 3 quick wins for email
        .map(rec => ({
            title: rec.title,
            description: rec.description,
            impact: rec.priority,
            implementation: rec.recommendation || 'Zie volledige rapport voor implementatie details',
            estimatedTime: rec.estimatedTime || '30-60 minuten'
        }));
}

// Frontend-friendly transformed types
export interface TransformedScanResults {
    overview: {
        url: string;
        overallScore: number | null;
        completedAt: string | null;
        status: string;
        screenshot?: string;
        tier?: ScanTier;
    };
    modules: {
        name: string;
        score: number;
        findings: Finding[];
        status: string;
        progress: number;
    }[];
    quickWins: QuickWin[];
    aiReport?: AIReport;
}

// Type guards for tier checking
export function isStarterResult(result: EngineScanResult): result is StarterScanResult {
    return result.tier === 'starter' && result.aiReport !== undefined;
}

export function isBusinessResult(result: EngineScanResult): result is BusinessScanResult {
    return result.tier === 'business' && result.aiReport !== undefined;
}

// Helper: Transform DB results to engine format
export function transformDBToEngine(
    dbScan: DBScan, 
    dbModules: DBModuleResult[]
): EngineScanResult {
    return {
        scanId: dbScan.id,
        url: dbScan.url,
        pageTitle: dbScan.page_title || undefined,
        status: dbScan.status as any,
        overallScore: dbScan.overall_score || 0,
        createdAt: dbScan.created_at,
        completedAt: dbScan.completed_at || undefined,
        tier: dbScan.tier as ScanTier,
        moduleResults: dbModules.map(dbModule => ({
            name: dbModule.module_name,
            score: dbModule.score,
            findings: dbModule.findings,
            status: dbModule.status,
            progress: dbModule.progress,
            completedAt: dbModule.completed_at || undefined
        })),
        aiReport: dbScan.ai_report ? JSON.parse(dbScan.ai_report) : undefined,
        error: dbScan.error,
        aiInsights: dbScan.ai_insights ? JSON.parse(dbScan.ai_insights) : undefined,
        narrativeReport: dbScan.narrative_report
            ? JSON.parse(dbScan.narrative_report)
            : undefined,
        costTracking: dbScan.cost_tracking ? JSON.parse(dbScan.cost_tracking) : undefined,
        pdfUrl: dbScan.pdf_url || null
    };
}

// Validation helpers
export function validateScanResult(result: any): result is EngineScanResult {
    return (
        result &&
        typeof result.scanId === 'string' &&
        typeof result.url === 'string' &&
        typeof result.overallScore === 'number' &&
        Array.isArray(result.moduleResults)
    );
}

export function validateAIReport(report: any): report is AIReport {
    return (
        report &&
        typeof report.summary === 'string' &&
        Array.isArray(report.recommendations) &&
        typeof report.estimatedImpact === 'string'
    );
}

// Phase 3 - Business Tier
export interface AIInsights {
    missedOpportunities: MissedOpportunity[];
    authorityEnhancements: AuthorityEnhancement[];
    citabilityImprovements: CitabilityImprovement[];
    implementationPriority: string[];
    generatedAt: string;
    confidence: number;
}

export interface NarrativeReport {
    executiveSummary: string;
    detailedAnalysis: string;
    implementationRoadmap: string;
    conclusionNextSteps: string;
    generatedAt: string;
    wordCount: number;
    // Enterprise-specific additions
    strategicRoadmap?: string;
    competitivePositioning?: string;
    keyMetrics?: {
        estimatedROI: string;
        implementationTimeframe: string;
        priorityActions: string[];
    };
}

// Enterprise Tier Types
export interface EnterpriseFeatures {
    multiPageAnalysis: MultiPageContent[];
    siteWidePatterns: SiteWidePatterns;
    competitiveContext: CompetitiveContext;
    industryBenchmark: IndustryBenchmark;
    analysisDepth: AnalysisDepth;
    error?: string;
}

export interface MultiPageContent {
    url: string;
    content: any; // Enhanced content from ContentExtractor
    relativePath: string;
}

export interface SiteWidePatterns {
    authoritySignals: any[];
    contentThemes: string[];
    consistencyIssues: string[];
    consistencyScore: number;
    patterns?: any[];
}

export interface CompetitiveContext {
    industryCategory?: string;
    benchmarkScore?: number;
    currentScore?: number;
    competitivePosition?: string;
    insights?: string[];
    benchmark?: string;
}

export interface IndustryBenchmark {
    category: string;
    benchmarkScore: number;
    currentScore: number;
    percentile: string;
    improvementPotential: number;
    score?: number;
}

export interface AnalysisDepth {
    totalPagesAnalyzed: number;
    contentSamples: number;
    patternConsistency: number;
}

// Helper types voor score berekening
export interface ScoredResult {
    score: number;
}

// Scan module interface
export interface ScanModule {
    execute(url: string, html?: string, $?: any): Promise<ModuleResult>;
}