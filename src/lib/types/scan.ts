import type { Database } from '$lib/supabase';

// Database row types
export type DBScan = Database['public']['Tables']['scans']['Row'];
export type DBModuleResult = {
    scan_id: number;
    module_name: string;
    status: 'waiting' | 'running' | 'completed' | 'failed';
    score: number;
    findings: Finding[];
    progress: number;
    completed_at: string | null;
};

// Shared types voor scan resultaten
export interface Finding {
    type: 'success' | 'warning' | 'error';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high';
    category: string;
    technicalDetails?: string;
}

export interface ModuleResult {
    moduleName: string; // Voor scan engine
    name: string;      // Voor email templates
    score: number;
    findings: Finding[];
}

export interface BaseScanResult {
    scanId: string;
    url: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    overallScore: number;
    createdAt: string;
    completedAt?: string;
}

// Voor de scan engine
export interface EngineScanResult extends BaseScanResult {
    moduleResults: ModuleResult[];
}

// Voor email templates
export interface EmailScanResult extends BaseScanResult {
    moduleResults: {
        name: string;
        score: number;
        findings: Finding[];
    }[];
}

// Helper functie voor conversie
export function convertToEmailFormat(scanResult: EngineScanResult): EmailScanResult {
    return {
        ...scanResult,
        moduleResults: scanResult.moduleResults.map(module => ({
            name: module.name || module.moduleName, // Gebruik name als het bestaat, anders moduleName
            score: module.score,
            findings: module.findings
        }))
    };
}

// Frontend-friendly transformed types
export interface TransformedScanResults {
    overview: {
        url: string;
        overallScore: number | null;
        completedAt: string | null;
        status: string;
    };
    modules: {
        name: string;
        score: number;
        findings: Finding[];
        status: string;
    }[];
    quickWins: {
        title: string;
        description: string;
        impact: 'high' | 'medium' | 'low';
        implementation: string;
    }[];
}
