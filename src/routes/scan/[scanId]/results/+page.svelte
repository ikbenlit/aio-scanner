<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/layout/Header.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  
  // New redesigned components
  import ScanHeader from '$lib/components/features/scan/ScanHeader.svelte';
  import PositiveReinforcement from '$lib/components/features/scan/PositiveReinforcement.svelte';
  import QuickWinsSection from '$lib/components/features/scan/QuickWinsSection.svelte';
  import GentleConversion from '$lib/components/features/scan/GentleConversion.svelte';
  import AiNarrativeSection from '$lib/components/features/scan/AiNarrativeSection.svelte';
  // Phase 1.4: Smart findings component
  import SmartFindingCard from '$lib/components/features/results/SmartFindingCard.svelte';
  
  // UX Redesign: New thematic components
  import ThemeIndex from '$lib/components/features/results/ThemeIndex.svelte';
  import AISummaryHero from '$lib/components/features/results/AISummaryHero.svelte';
  import ThematicSection from '$lib/components/features/results/ThematicSection.svelte';
  import ImpactEffortMatrix from '$lib/components/features/results/ImpactEffortMatrix.svelte';
  
  // Components
  import WebsitePreview from '$lib/components/features/scan/WebsitePreview.svelte';
  
  import type { PrioritizedAction } from '$lib/results/prioritization';
  import type { BusinessAction } from '$lib/results/translation';
  import type { ScanTier } from '$lib/types/database';
  import type { Finding } from '$lib/types/scan';
  
  interface ScanModule {
    id?: string;
    name: string;
    icon?: string;
    score: number;
    findings: Array<{
      type?: 'success' | 'warning' | 'error';
      priority?: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      message?: string;
    }>;
  }
  
  interface PageData {
    scan: {
      id: string;
      url: string;
      pageTitle: string | null;
      status: string;
      overallScore: number;
      moduleResults: ScanModule[];
      createdAt: string;
      completedAt: string | null;
      screenshot?: string;
      tier: string;
      pdfGenerationStatus: string | null;
      pdfUrl: string | null;
    };
    emailStatus: {
      email: string | null;
      sentAt: string | null;
    };
    businessInsights: {
      quickWins: PrioritizedAction[];
      positiveFindings: string[];
      totalActions: number;
      allActions: BusinessAction[];
      // Phase 2: AI narrative and insights
      aiNarrative: any;
      aiInsights: any;
      // Phase 3.4: Key insights for Business tier enhancement
      keyInsights: any;
      // Phase 1.4: Smart findings with evidence/suggestions
      smartFindings: Finding[];
      // Tier-specific metadata
      tier: ScanTier;
      aiPreviewBadge: string | null;
      // Content filtering info
      isBasicTier: boolean;
      hasAIContent: boolean;
      hasAdvancedInsights: boolean;
      hasSmartFindings: boolean;
    };
    // UX Redesign: Thematic organization and AI summary
    thematicData: {
      themes: import('$lib/results/thematic-grouping').ThematicGroup[];
      summary: {
        motivationalMessage: string;
        keyPriorities: string[];
        benchmarkMessage: string;
        nextSteps: string[];
      };
    };
    screenshot: string | null;
    error: string | null;
  }
  
  export let data: PageData;
  const { scan, emailStatus, businessInsights, thematicData, screenshot, error } = data;
  
  console.log('🎨 New Results Page - Redesigned!');
  console.log('Quick Wins:', businessInsights.quickWins);
  console.log('Positive Findings:', businessInsights.positiveFindings);
  console.log('Total Actions:', businessInsights.totalActions);
  
  let emailSentTime: string | null = null;
  if (emailStatus.sentAt) {
    try {
      const sentDate = new Date(emailStatus.sentAt);
      emailSentTime = sentDate.toLocaleString('nl-NL', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.warn('Invalid email sent date:', emailStatus.sentAt);
    }
  }

    

  // Phase 1.3: Enhanced PDF download with loading state
  let isGeneratingPDF = false;
  
  async function downloadPDF() {
    if (!scan.pdfUrl) {
      console.error('No PDF URL available');
      return;
    }
    
    try {
      isGeneratingPDF = true;
      
      // Simulate brief loading for UX (even though PDF is ready)
      await new Promise(resolve => setTimeout(resolve, 800));
      
      window.open(scan.pdfUrl, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
    } finally {
      isGeneratingPDF = false;
    }
  }

  // Format tier display name
  function formatTierName(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'basic': return 'Basic';
      case 'starter': return 'Starter';
      case 'business': return 'Business';
      case 'enterprise': return 'Enterprise';
      default: return tier;
    }
  }

  // Get properly typed tier for components
  function getScanTier(tier: string): ScanTier {
    return tier as ScanTier;
  }
</script>

<svelte:head>
  <title>Scan Resultaten - {scan.url} | AIO Scanner</title>
  <meta name="description" content="AI-optimalisatie resultaten voor {scan.url}" />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50 py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Error State -->
    {#if error}
      <Alert class="mb-8 border-red-200 bg-red-50">
        <AlertDescription class="text-red-800">
          <strong>Fout bij laden:</strong> {error}
        </AlertDescription>
      </Alert>
    {/if}



    <!-- NEW THEMATIC RESULTS PAGE LAYOUT -->
    {#if thematicData.themes.length > 0}
      
      <!-- AI Summary Hero Section -->
      <AISummaryHero 
        motivationalMessage={thematicData.summary.motivationalMessage}
        keyPriorities={thematicData.summary.keyPriorities}
        benchmarkMessage={thematicData.summary.benchmarkMessage}
        nextSteps={thematicData.summary.nextSteps}
        overallScore={scan.overallScore}
        url={scan.url}
      />
      
      <!-- Sticky Theme Navigation -->
      <ThemeIndex themes={thematicData.themes} />
      
      <!-- Impact vs Effort Matrix (Quick Wins Visualization) -->
      <ImpactEffortMatrix themes={thematicData.themes} />
      
      <!-- Thematic Sections -->
      <div class="space-y-6">
        {#each thematicData.themes as theme}
          <ThematicSection {theme} />
        {/each}
      </div>
      
      <!-- Gentle Conversion (tier-aware messaging) -->
      <GentleConversion 
        tier={businessInsights.tier}
        quickWinsCount={businessInsights.quickWins.length}
        totalActionsCount={businessInsights.totalActions}
        placement="bottom"
        aiPreviewBadge={businessInsights.aiPreviewBadge}
      />
      
      <!-- AI-Narrative Section for paid tiers -->
      <AiNarrativeSection 
        aiNarrative={businessInsights.aiNarrative}
        aiInsights={businessInsights.aiInsights}
        tier={businessInsights.tier}
        isLocked={businessInsights.tier === 'basic' || businessInsights.tier === 'starter'}
      />
      
    {:else}
      <!-- Fallback to original layout if no thematic data -->
      <div class="space-y-8">
        
        <!-- Phase 1: Enhanced Scan Header -->
        <ScanHeader 
          score={scan.overallScore} 
          url={scan.url}
          pageTitle={scan.pageTitle}
          tier={scan.tier}
          keyInsights={businessInsights.keyInsights}
        />

        <!-- Phase 2: Positive Reinforcement -->
        {#if businessInsights.positiveFindings.length > 0}
          <PositiveReinforcement 
            positiveFindings={businessInsights.positiveFindings}
            showTitle={true}
          />
        {/if}

        <!-- Phase 2: Quick Wins Section (Show aiPreviewBadge for basic tier) -->
        <QuickWinsSection 
          quickWins={businessInsights.quickWins}
          totalActions={businessInsights.totalActions}
          tier={businessInsights.tier}
          aiPreviewBadge={businessInsights.tier === 'basic' ? businessInsights.aiPreviewBadge : null}
        />

        <!-- Phase 1.4: Smart Findings Section -->
        {#if businessInsights.hasSmartFindings && businessInsights.smartFindings.length > 0}
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-2xl">🧠</span>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Slimme Analyse</h3>
                <p class="text-sm text-gray-600">Gedetailleerde bevindingen met bewijsmateriaal en concrete suggesties</p>
              </div>
            </div>
            
            <div class="space-y-4">
              {#each businessInsights.smartFindings as finding, index (index)}
                <SmartFindingCard {finding} />
              {/each}
            </div>
          </div>
        {/if}

        <!-- Phase 3: Gentle Conversion (Always show, tier-aware messaging) -->
        <GentleConversion 
          tier={businessInsights.tier}
          quickWinsCount={businessInsights.quickWins.length}
          totalActionsCount={businessInsights.totalActions}
          placement="after-quickwins"
          aiPreviewBadge={businessInsights.aiPreviewBadge}
        />

        <!-- Phase 4: AI-Narrative Section (Lock based on tier) -->
        <AiNarrativeSection 
          aiNarrative={businessInsights.aiNarrative}
          aiInsights={businessInsights.aiInsights}
          tier={businessInsights.tier}
          isLocked={businessInsights.tier === 'basic' || businessInsights.tier === 'starter'}
        />
      </div>
    {/if}
    
    <!-- Email & PDF Section (always show if available) -->
    {#if emailStatus.email && emailSentTime}
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <div class="flex items-center gap-3 mb-4">
          <span class="text-2xl">📧</span>
          <h3 class="text-lg font-semibold text-gray-900">Rapport verzonden</h3>
        </div>
        <p class="text-gray-600 mb-4">
          Het volledige rapport is verzonden naar <strong>{emailStatus.email}</strong> op {emailSentTime}.
        </p>
        
        <!-- PDF Download Button (Only for non-basic tiers with completed PDF) -->
        {#if !businessInsights.isBasicTier && scan.pdfGenerationStatus === 'completed' && scan.pdfUrl}
          <Button 
            class="bg-blue-600 hover:bg-blue-700 text-white {isGeneratingPDF ? 'opacity-75 cursor-not-allowed' : ''}"
            on:click={downloadPDF}
            disabled={isGeneratingPDF}
          >
            {#if isGeneratingPDF}
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Een moment geduld, onze AI stelt uw persoonlijke rapport samen...
            {:else}
              📄 Download PDF met AI-samenvatting
            {/if}
          </Button>
        {/if}
      </div>
    {/if}

    <!-- Website Preview (if screenshot available) -->
    {#if screenshot}
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Website Preview</h3>
        <WebsitePreview websiteScreenshot={screenshot} websiteUrl={scan.url} />
      </div>
    {/if}

    <!-- Scan Metadata -->
    <div class="bg-white rounded-xl p-6 border border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span class="text-gray-500">Scan Type:</span>
          <span class="font-medium ml-2">{formatTierName(scan.tier)}</span>
        </div>
        <div>
          <span class="text-gray-500">Voltooid op:</span>
          <span class="font-medium ml-2">
            {scan.completedAt ? new Date(scan.completedAt).toLocaleString('nl-NL') : 'Nog niet voltooid'}
          </span>
        </div>
        <div>
          <span class="text-gray-500">Scan ID:</span>
          <span class="font-mono text-xs ml-2">{scan.id}</span>
        </div>
      </div>
    </div>

  </div>
</main>

<style>
  /* Smooth transitions for view switching */
  main {
    transition: all 0.3s ease;
  }

  /* Focus styles for accessibility */
  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>