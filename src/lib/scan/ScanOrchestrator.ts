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
    
    try {
      // 1. Fetch content (Cheerio → Playwright fallback)
      console.log('Fetching content...');
      const { html, metadata } = await this.contentFetcher.fetchContent(url);
      console.log(`Content fetched using ${metadata.fetchMethod} in ${metadata.responseTime}ms`);

      // 2. Run modules parallel met progress tracking
      console.log('Starting module analysis...');
      const moduleResults = await this.runModulesParallel(url, html, scanId, metadata);

      // 3. Calculate overall score
      const overallScore = this.calculateOverallScore(moduleResults);

      // 4. Create scan result
      const scanResult: ScanResult = {
        scanId,
        url,
        status: 'completed',
        overallScore,
        moduleResults,
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };

      // NIEUW: Update scan status in database
      await getSupabaseClient()
        .from('scans')
        .update({
          status: 'completed',
          overall_score: overallScore,
          completed_at: new Date().toISOString()
        })
        .eq('id', scanId);

      console.log(`Scan completed for ${url} with score ${overallScore}`);
      return scanResult;

    } catch (error) {
      console.error(`Scan failed for ${url}:`, error);
      throw error;
    }
  }

  private async runModulesParallel(
    url: string, 
    html: string, 
    scanId: string, 
    metadata: any
  ): Promise<ModuleResult[]> {
    
    const modulePromises = this.modules.map(async (module) => {
      try {
        console.log(`Starting ${module.name} analysis...`);
        
        // Run module analysis with timeout
        const result = await this.runModuleWithTimeout(module, url, html, metadata);
        
        // NIEUW: Update scan_modules tabel
        await getSupabaseClient()
          .from('scan_modules')
          .insert({
            scan_id: scanId,
            module_name: module.name,
            status: 'completed',
            score: result.score,
            findings: result.findings,
            progress: 100,
            completed_at: new Date().toISOString()
          });

        console.log(`${module.name} completed with score ${result.score}`);
        return result;

      } catch (error) {
        console.error(`${module.name} failed:`, error);
        
        // Return fallback result instead of 0
        return {
          moduleName: module.name,
          score: 50, // Fallback score - better than 0
          status: 'failed' as const,
          findings: [{
            type: 'error' as const,
            title: 'Module temporarily unavailable',
            description: `${module.name} analysis could not be completed`,
            impact: 'medium' as const,
            category: 'system'
          }],
          recommendations: []
        };
      }
    });

    // Wait for all modules to complete
    const results = await Promise.all(modulePromises);
    return results;
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