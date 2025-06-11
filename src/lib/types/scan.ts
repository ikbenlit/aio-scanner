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

// Finding type voor scan resultaten
export interface Finding {
    type: 'success' | 'warning' | 'error';
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
    recommendation?: string;
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
