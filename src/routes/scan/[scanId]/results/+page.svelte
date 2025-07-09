<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/layout/Header.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  
  // New redesigned components
  import ScoreHero from '$lib/components/features/scan/ScoreHero.svelte';
  import PositiveReinforcement from '$lib/components/features/scan/PositiveReinforcement.svelte';
  import QuickWinsSection from '$lib/components/features/scan/QuickWinsSection.svelte';
  import GentleConversion from '$lib/components/features/scan/GentleConversion.svelte';
  import AiNarrativeSection from '$lib/components/features/scan/AiNarrativeSection.svelte';
  
  // Legacy components (keep for fallback/debugging)
  import ProgressCircle from '$lib/components/features/scan/ProgressCircle.svelte';
  import ModuleProgressGrid from '$lib/components/features/scan/ModuleProgressGrid.svelte';
  import WebsitePreview from '$lib/components/features/scan/WebsitePreview.svelte';
  
  import type { PrioritizedAction } from '$lib/results/prioritization';
  import type { BusinessAction } from '$lib/results/translation';
  import type { ScanTier } from '$lib/types/database';
  
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
      // Tier-specific metadata
      tier: ScanTier;
      aiPreviewBadge: string | null;
      // Content filtering info
      isBasicTier: boolean;
      hasAIContent: boolean;
      hasAdvancedInsights: boolean;
    };
    screenshot: string | null;
    error: string | null;
  }
  
  export let data: PageData;
  const { scan, emailStatus, businessInsights, screenshot, error } = data;
  
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

  // Explicitly create a number for the legacy component to avoid linter issues
  let legacyScore: number = 0;
  if (scan && scan.overallScore) {
    legacyScore = Number(scan.overallScore);
  }

  // Legacy module items for backward compatibility
  const moduleItems = [
    { id: 'technical_seo', name: 'Technical SEO', icon: '🔧' },
    { id: 'schema_markup', name: 'Schema Markup', icon: '📋' },
    { id: 'ai_content', name: 'AI Content', icon: '🤖' },
    { id: 'ai_citation', name: 'AI Citation', icon: '📑' },
    { id: 'cross_web_presence', name: 'Cross-web Presence', icon: '🌐' },
    { id: 'content_freshness', name: 'Content Freshness', icon: '🔄' }
  ];

  // Show legacy view for debugging (can be removed later)
  let showLegacyView = false;
  
  // Create a reactive variable to ensure score is a number for legacy components
  $: legacyScore = Number(scan.overallScore);

  // Check if this is development mode
  const isDevelopment = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname.includes('dev'));

  function toggleLegacyView() {
    showLegacyView = !showLegacyView;
  }

  // Handle PDF download
  async function downloadPDF() {
    if (!scan.pdfUrl) {
      console.error('No PDF URL available');
      return;
    }
    
    try {
      window.open(scan.pdfUrl, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
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

    <!-- Development Controls -->
    {#if isDevelopment}
      <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div class="flex items-center justify-between">
          <span class="text-sm text-yellow-800">🚧 Development Mode</span>
          <button 
            class="text-xs bg-yellow-200 px-2 py-1 rounded hover:bg-yellow-300"
            on:click={toggleLegacyView}
          >
            {showLegacyView ? 'Hide' : 'Show'} Legacy View
          </button>
        </div>
      </div>
    {/if}

    <!-- NEW REDESIGNED RESULTS PAGE -->
    {#if !showLegacyView}
      <div class="space-y-8">
        
        <!-- Phase 1: Score Hero -->
        <ScoreHero 
          score={scan.overallScore} 
          url={scan.url}
          showContext={true}
        />

        <!-- Phase 2: Positive Reinforcement -->
        {#if businessInsights.positiveFindings.length > 0}
          <PositiveReinforcement 
            positiveFindings={businessInsights.positiveFindings}
            showTitle={true}
          />
        {/if}

        <!-- Phase 2: Quick Wins Section -->
        <QuickWinsSection 
          quickWins={businessInsights.quickWins}
          totalActions={businessInsights.totalActions}
          tier={businessInsights.tier}
          aiPreviewBadge={businessInsights.aiPreviewBadge}
        />

        <!-- Phase 3: Gentle Conversion -->
        <GentleConversion 
          tier={businessInsights.tier}
          quickWinsCount={businessInsights.quickWins.length}
          totalActionsCount={businessInsights.totalActions}
          placement="after-quickwins"
          aiPreviewBadge={businessInsights.aiPreviewBadge}
        />

        <!-- Phase 4: AI-Narrative Section -->
        <AiNarrativeSection 
          aiNarrative={businessInsights.aiNarrative}
          aiInsights={businessInsights.aiInsights}
          tier={businessInsights.tier}
          isLocked={businessInsights.isBasicTier}
        />

        <!-- Email & PDF Section -->
        {#if emailStatus.email && emailSentTime}
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-2xl">📧</span>
              <h3 class="text-lg font-semibold text-gray-900">Rapport verzonden</h3>
            </div>
            <p class="text-gray-600 mb-4">
              Het volledige rapport is verzonden naar <strong>{emailStatus.email}</strong> op {emailSentTime}.
            </p>
            
            <!-- PDF Download Button -->
            {#if scan.tier !== 'basic' && scan.pdfGenerationStatus === 'completed' && scan.pdfUrl}
              <Button 
                class="bg-blue-600 hover:bg-blue-700 text-white"
                on:click={downloadPDF}
              >
                📄 Download PDF Rapport
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
    {/if}

    <!-- LEGACY VIEW (for development/fallback) -->
    {#if showLegacyView || isDevelopment}
      <div class="space-y-8 {showLegacyView ? '' : 'opacity-50 pointer-events-none'}">
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h2 class="font-semibold text-yellow-800 mb-2">🔧 Legacy View</h2>
          <p class="text-sm text-yellow-700">
            This is the original results page layout. The new redesigned version is shown above.
          </p>
        </div>

        <!-- Legacy content here -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="text-center mb-8">
            <ProgressCircle score={Number(legacyScore) || 0} size="large" />
            <h1 class="text-2xl font-bold text-gray-900 mt-4">
              Scan Resultaten voor {scan.url}
            </h1>
            <p class="text-gray-600 mt-2">
              Voltooid op {scan.completedAt ? new Date(scan.completedAt).toLocaleDateString('nl-NL') : 'Nog niet voltooid'}
            </p>
          </div>

          <ModuleProgressGrid 
            modules={moduleItems} 
          />
        </div>
      </div>
    {/if}

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