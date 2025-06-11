import type { ScanModule, ScanResult, ModuleResult } from './types.js';
import { ContentFetcher } from './ContentFetcher.js';
import { TechnicalSEOModule } from './modules/TechnicalSEOModule.js';
import { SchemaMarkupModule } from './modules/SchemaMarkupModule.js';
import { getSupabaseClient } from '$lib/supabase';

export class ScanOrchestrator {
  private contentFetcher = new ContentFetcher();
  private modules: ScanModule[] = [];

  constructor() {
    // Initialize MVP modules (2 modules ready for testing)
    this.modules = [
      new TechnicalSEOModule(),
      new SchemaMarkupModule(),
    ];
  }

  async executeScan(url: string, scanId: string): Promise<ScanResult> {
    console.log(`Starting scan for ${url} with ID ${scanId}`);
    const supabase = getSupabaseClient();
    const numericScanId = parseInt(scanId, 10);

    try {
      // 1. Set scan status to 'running'
      await supabase
        .from('scans')
        .update({ status: 'running', progress: 5 })
        .eq('id', numericScanId);

      // 2. Fetch content
      console.log('Fetching content...');
      const { html, metadata } = await this.contentFetcher.fetchContent(url);
      console.log(`Content fetched using ${metadata.fetchMethod} in ${metadata.responseTime}ms`);

      // 3. Run modules and track progress
      console.log('Starting module analysis...');
      const moduleResults = await this.runModulesParallel(url, html, numericScanId, metadata);

      // 4. Calculate overall score
      const overallScore = this.calculateOverallScore(moduleResults);

      // 5. Create final scan result object
      const scanResult: ScanResult = {
        scanId,
        url,
        status: 'completed',
        overallScore,
        moduleResults,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // 6. Update scan to 'completed' in the database
      await supabase
        .from('scans')
        .update({
          status: 'completed',
          progress: 100,
          overall_score: overallScore,
          result_json: scanResult as any, // Cast to any to avoid type issues for now
          completed_at: new Date().toISOString()
        })
        .eq('id', numericScanId);

      console.log(`Scan completed for ${url} with score ${overallScore}`);
      return scanResult;

    } catch (error) {
      console.error(`Scan failed for ${url}:`, error);
      // Update scan status to failed
      await supabase
        .from('scans')
        .update({ status: 'failed', progress: 100 })
        .eq('id', parseInt(scanId, 10));
      throw error;
    }
  }

  private async runModulesParallel(
    url: string, 
    html: string, 
    scanId: number, 
    metadata: any
  ): Promise<ModuleResult[]> {
    const supabase = getSupabaseClient();
    const totalModules = this.modules.length;
    const accumulatedResults: ModuleResult[] = [];

    for (let i = 0; i < this.modules.length; i++) {
      const module = this.modules[i];
      let result: ModuleResult;

      try {
        console.log(`Starting ${module.name} analysis...`);
        result = await this.runModuleWithTimeout(module, url, html, metadata);
        console.log(`${module.name} completed with score ${result.score}`);
      } catch (error) {
        console.error(`${module.name} failed:`, error);
        result = {
          moduleName: module.name,
          score: 0,
          status: 'failed' as const,
          findings: [{
            type: 'error' as const,
            title: 'Module kon niet worden uitgevoerd',
            description: `${module.name} is mislukt vanwege een technische fout.`,
            impact: 'high' as const,
            category: 'system'
          }],
          recommendations: []
        };
      }

      accumulatedResults.push(result);
      const progress = 5 + Math.round(((i + 1) / totalModules) * 90); // Progress from 5% to 95%

      // Update progress and partial results in the database
      await supabase
        .from('scans')
        .update({
          progress: progress,
          // Storing partial results for the frontend to render
          result_json: { moduleResults: accumulatedResults } as any // Cast to any to avoid type issues
        })
        .eq('id', scanId);
    }

    return accumulatedResults;
  }

  private async runModuleWithTimeout(
    module: ScanModule, 
    url: string, 
    html: string, 
    metadata: any
  ): Promise<ModuleResult> {
    
    const timeout = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Module timeout')), 30000)
    );

    return Promise.race([
      module.analyze(url, html, metadata),
      timeout
    ]);
  }

  private calculateOverallScore(moduleResults: ModuleResult[]): number {
    if (moduleResults.length === 0) return 0;

    const validResults = moduleResults.filter(result => result.status === 'completed');
    if (validResults.length === 0) return 0;

    // Simple average for MVP - can be made more sophisticated later
    const totalScore = validResults.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / validResults.length);
  }

  // Helper method om beschikbare modules te krijgen
  getAvailableModules(): string[] {
    return this.modules.map(module => module.name);
  }

  // Helper voor testing
  async testModule(moduleName: string, url: string): Promise<ModuleResult | null> {
    const module = this.modules.find(m => m.name === moduleName);
    if (!module) return null;

    try {
      const { html, metadata } = await this.contentFetcher.fetchContent(url);
      return await module.analyze(url, html, metadata);
    } catch (error) {
      console.error(`Test failed for ${moduleName}:`, error);
      return null;
    }
  }
} 