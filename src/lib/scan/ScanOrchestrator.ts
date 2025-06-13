import type { EngineScanResult, ModuleResult } from '../types/scan';
import type { ScanTier } from '../types/database';
import { upsertUserScanHistory } from '../services/emailHistoryService';
import { AIReportGenerator } from './AIReportGenerator';
import { TechnicalSEOModule } from './modules/TechnicalSEOModule';
import { SchemaMarkupModule } from './modules/SchemaMarkupModule';
import { AIContentModule } from './modules/AIContentModule';
import { AICitationModule } from './modules/AICitationModule';

interface ScanModule {
    execute(url: string): Promise<ModuleResult>;
}

export class ScanOrchestrator {
    private modules: ScanModule[] = [
        new TechnicalSEOModule(),
        new SchemaMarkupModule(),
        new AIContentModule(),
        new AICitationModule()
    ];

    private aiReportGenerator = new AIReportGenerator();

    // Legacy method - blijft behouden voor backwards compatibility
    async executeScan(url: string, scanId: string): Promise<void> {
        try {
            // Execute basic scan for anonymous users
            await this.executeTierScan(url, 'basic', scanId);
        } catch (error) {
            console.error(`Scan execution failed for ${scanId}:`, error);
            throw error; // Re-throw to be caught by caller
        }
    }

    async executeTierScan(
        url: string,
        tier: ScanTier,
        scanId: string,
        email?: string,
        paymentId?: string
    ): Promise<EngineScanResult> {
        // Validate required fields for paid tiers
        if (tier !== 'basic' && (!email || !paymentId)) {
            throw new Error('Email en paymentId zijn verplicht voor betaalde tiers');
        }

        let result: EngineScanResult;

        // Execute modules based on tier
        switch (tier) {
            case 'basic':
                result = await this.executeBasicScan(url, scanId);
                break;
            case 'starter':
                result = await this.executeStarterScan(url, scanId);
                break;
            case 'business':
                result = await this.executeBusinessScan(url, scanId);
                break;
            case 'enterprise':
                result = await this.executeEnterpriseScan(url, scanId);
                break;
            default:
                throw new Error(`Niet-ondersteunde tier: ${tier}`);
        }

        // Update user scan history voor alle tiers
        if (email) {
            await upsertUserScanHistory({
                email,
                scanId: parseInt(scanId, 10),
                isPaid: tier !== 'basic',
                amount: this.getTierPrice(tier)
            });
        }

        return result;
    }

    private async executeBasicScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.log(`🔍 Starting basic scan for ${url} (${scanId})`);
        
        // Execute core modules in parallel
        const moduleResults = await Promise.all(
            this.modules.slice(0, 2).map(module => module.execute(url))
        );

        // Calculate overall score
        const overallScore = Math.round(
            moduleResults.reduce((sum: number, result: ModuleResult) => sum + result.score, 0) / moduleResults.length
        );

        return {
            scanId,
            url,
            status: 'completed',
            createdAt: new Date().toISOString(),
            overallScore,
            moduleResults,
            completedAt: new Date().toISOString(),
            tier: 'basic' as const
        };
    }

    private async executeStarterScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.log(`🔍 Starting starter scan for ${url} (${scanId})`);
        
        // Execute basic scan first
        const basicResult = await this.executeBasicScan(url, scanId);
        
        // Generate AI report
        const aiReport = await this.aiReportGenerator.generateReport(basicResult);

        // Execute additional starter modules
        const additionalResults = await Promise.all(
            this.modules.slice(2, 3).map(module => module.execute(url))
        );

        return {
            ...basicResult,
            moduleResults: [...basicResult.moduleResults, ...additionalResults],
            aiReport,
            tier: 'starter' as const
        };
    }

    private async executeBusinessScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.log(`🔍 Starting business scan for ${url} (${scanId})`);
        
        // Execute starter scan first
        const starterResult = await this.executeStarterScan(url, scanId);
        
        // Execute all remaining modules
        const businessResults = await Promise.all(
            this.modules.slice(3).map(module => module.execute(url))
        );

        // Generate enhanced AI report
        const aiReport = await this.aiReportGenerator.generateReport({
            ...starterResult,
            moduleResults: [...starterResult.moduleResults, ...businessResults]
        });

        return {
            ...starterResult,
            moduleResults: [...starterResult.moduleResults, ...businessResults],
            aiReport,
            tier: 'business' as const
        };
    }

    private async executeEnterpriseScan(url: string, scanId: string): Promise<EngineScanResult> {
        console.log(`🔍 Starting enterprise scan for ${url} (${scanId})`);
        
        // Execute business scan first
        const businessResult = await this.executeBusinessScan(url, scanId);
        
        // Enterprise features worden in Phase 4 toegevoegd
        throw new Error('Enterprise tier wordt geïmplementeerd in Phase 4');
    }

    private getTierPrice(tier: ScanTier): number {
        const prices = {
            'basic': 0,
            'starter': 19.95,
            'business': 49.95,
            'enterprise': 149.95
        } as const;
        
        return prices[tier];
    }
}
