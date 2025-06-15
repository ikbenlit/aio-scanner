// src/lib/types/scan.ts
import type { Database } from '../supabase';
import { ScanTier } from '../types/database';
import type { EngineScanResult } from '../types/scan';

// Database row types - extended with new columns from Phase 1
export type DBScan = Database['public']['Tables']['scans']['Row'] & {
    tier: ScanTier;
    payment_reference: string | null;
    user_email: string | null;
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
    recommendation: boolean;
    type: 'success' | 'warning' | 'error';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
    technicalDetails?: string;
}

export interface ModuleResult {
    moduleName: string; // Consistent naming - gebruikt door scan engine
    score: number;
    findings: Finding[];
    status: 'waiting' | 'running' | 'completed' | 'failed';
    progress: number;
    completedAt?: string;
}

// AI Report interface - moved here for central access
export interface AIReport {
    summary: string;
    recommendations: {
        module: string;
        title: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
        difficulty: 'easy' | 'medium' | 'hard';
        codeExample?: string;
        estimatedImpact?: string;
    }[];
    implementationPlan: string[];
    estimatedImpact: string;
    generatedAt?: string;
}

export interface BaseScanResult {
    scanId: string;
    url: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    overallScore: number;
    createdAt: string;
    completedAt?: string;
}

// Voor de scan engine - main interface
export interface EngineScanResult extends BaseScanResult {
    moduleResults: ModuleResult[];
    tier: ScanTier;  // Changed from optional to required
    aiReport?: AIReport;
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
    tier: ScanTier.Starter;  // Use enum value
    aiReport: AIReport;
    pdfUrl?: string;
}

export interface BusinessScanResult extends EngineScanResult {
    tier: ScanTier.Business;  // Use enum value
    aiReport: AIReport;
    llmInsights?: any;
    pdfUrl?: string;
}

// Helper functie voor conversie naar email format
export function convertToEmailFormat(scanResult: EngineScanResult): EmailScanResult {
    return {
        ...scanResult,
        moduleResults: scanResult.moduleResults.map(module => ({
            name: module.moduleName.replace('Module', ''), // "TechnicalSEOModule" → "TechnicalSEO"
            score: module.score,
            findings: module.findings
        })),
        quickWins: scanResult.aiReport ? convertToQuickWins(scanResult.aiReport) : undefined
    };
}

// Helper: Convert AI recommendations to quick wins for email
export function convertToQuickWins(aiReport: AIReport): QuickWin[] {
    return aiReport.recommendations
        .filter(rec => rec.priority === 'high' && rec.difficulty === 'easy')
        .slice(0, 3) // Top 3 quick wins for email
        .map(rec => ({
            title: rec.title,
            description: rec.description,
            impact: rec.priority,
            implementation: rec.codeExample || 'Zie volledige rapport voor implementatie details',
            estimatedTime: rec.difficulty === 'easy' ? '5-15 minuten' : '30-60 minuten'
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
    return result.tier === ScanTier.Starter && result.aiReport !== undefined;
}

export function isBusinessResult(result: EngineScanResult): result is BusinessScanResult {
    return result.tier === ScanTier.Business && result.aiReport !== undefined;
}

// Helper: Transform DB results to engine format
export function transformDBToEngine(
    dbScan: DBScan, 
    dbModules: DBModuleResult[]
): EngineScanResult {
    return {
        scanId: dbScan.id,
        url: dbScan.url,
        status: dbScan.status as any,
        overallScore: dbScan.overall_score || 0,
        createdAt: dbScan.created_at,
        completedAt: dbScan.completed_at || undefined,
        tier: dbScan.tier as ScanTier,
        moduleResults: dbModules.map(dbModule => ({
            moduleName: dbModule.module_name,
            score: dbModule.score,
            findings: dbModule.findings,
            status: dbModule.status,
            progress: dbModule.progress,
            completedAt: dbModule.completed_at || undefined
        }))
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
        Array.isArray(report.implementationPlan) &&
        typeof report.estimatedImpact === 'string'
    );
}

export interface ScanModule {
    execute(url: string): Promise<ModuleResult>;
}

export interface Finding {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

// Helper types voor score berekening
export interface ScoredResult {
    score: number;
}