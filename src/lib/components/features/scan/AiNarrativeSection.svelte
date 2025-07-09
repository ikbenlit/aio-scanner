<!-- src/lib/components/features/scan/AiNarrativeSection.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import type { ScanTier } from '$lib/types/database';

  export let aiNarrative: string | null = null;
  export let aiInsights: string[] | null = null;
  export let tier: ScanTier;
  export let isLocked: boolean = false;

  // Tier-aware computed properties
  $: isBasicTier = tier === 'basic';
  $: hasAIContent = tier !== 'basic';
  $: hasAdvancedInsights = tier === 'business' || tier === 'enterprise';

  // Get tier-specific messaging
  function getTierMessaging(currentTier: ScanTier) {
    switch (currentTier) {
      case 'basic':
        return {
          title: 'Strategisch Groeiplan',
          lockTitle: 'AI-Strategisch Groeiplan',
          lockDescription: 'Krijg een volledig AI-gegenereerde analyse van je website met concrete strategische aanbevelingen.',
          cta: 'Upgrade voor AI-Insights',
          previewText: 'Deze AI-analyse bevat gepersonaliseerde strategieën en implementatie-roadmaps...'
        };
      case 'starter':
        return {
          title: 'AI-Strategisch Overzicht',
          lockTitle: 'Uitgebreid AI-Groeiplan',
          lockDescription: 'Upgrade naar Business voor een volledig AI-gegenereerde strategische analyse.',
          cta: 'Upgrade naar Business',
          previewText: 'De Business-tier bevat diepgaande AI-analyses en implementatie-roadmaps...'
        };
      case 'business':
        return {
          title: 'AI-Strategisch Groeiplan',
          lockTitle: null,
          lockDescription: null,
          cta: null,
          previewText: null
        };
      case 'enterprise':
        return {
          title: 'Enterprise AI-Strategie',
          lockTitle: null,
          lockDescription: null,
          cta: null,
          previewText: null
        };
      default:
        return {
          title: 'AI-Insights',
          lockTitle: 'Premium AI-Insights',
          lockDescription: 'Upgrade voor AI-gegenereerde analyses.',
          cta: 'Upgrade',
          previewText: 'Premium AI-analyses beschikbaar...'
        };
    }
  }

  $: messaging = getTierMessaging(tier);

  function handleUpgradeClick() {
    // Track conversion intent
    console.log('ANALYTICS: upgrade_cta_clicked', { 
      source_tier: tier, 
      target_tier: tier === 'basic' ? 'starter' : 'business',
      location: 'ai_narrative_lock_overlay'
    });
    
    if (tier === 'basic') {
      window.location.href = '/pricing?from=ai-narrative&tier=starter';
    } else if (tier === 'starter') {
      window.location.href = '/pricing?from=ai-narrative&tier=business';
    }
  }

  // Format AI narrative text (basic markdown support)
  function formatNarrative(text: string): string {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
  }
</script>

<div class="space-y-6">
  <!-- Section Header -->
  <div class="text-center">
    <div class="flex items-center justify-center gap-3 mb-3">
      <span class="text-2xl">🧠</span>
      <h2 class="text-2xl font-bold text-gray-900">
        {messaging.title}
      </h2>
    </div>
    
    {#if hasAIContent}
      <p class="text-gray-600 max-w-2xl mx-auto">
        AI-gegenereerde strategische aanbevelingen op basis van je website-analyse
      </p>
    {/if}
  </div>

  <!-- AI Narrative Content -->
  {#if isLocked}
    <!-- Locked State for Basic/Starter Tiers -->
    <div class="relative bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
      <!-- Lock Overlay -->
      <div class="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
        <div class="text-center max-w-md mx-auto p-6">
          <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-2xl">🔒</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {messaging.lockTitle}
          </h3>
          <p class="text-gray-600 text-sm mb-6">
            {messaging.lockDescription}
          </p>
          <Button 
            class="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 font-medium"
            on:click={handleUpgradeClick}
          >
            {messaging.cta}
          </Button>
        </div>
      </div>

      <!-- Preview Content (blurred) -->
      <div class="filter blur-sm select-none">
        <div class="prose prose-gray max-w-none">
          <p class="text-gray-700 leading-relaxed">
            {messaging.previewText}
          </p>
          <div class="mt-6">
            <h4 class="font-semibold text-gray-900 mb-3">Strategische Aanbevelingen:</h4>
            <ul class="space-y-2">
              <li class="flex items-start gap-2">
                <span class="text-purple-600 text-sm mt-1">▶</span>
                <span class="text-gray-700">Optimaliseer je content voor AI-assistenten met...</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-600 text-sm mt-1">▶</span>
                <span class="text-gray-700">Implementeer schema markup voor betere...</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-purple-600 text-sm mt-1">▶</span>
                <span class="text-gray-700">Versterk je autoriteit met gestructureerde...</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  {:else if hasAIContent && aiNarrative}
    <!-- Unlocked State for Business/Enterprise Tiers -->
    <div class="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-8 border border-purple-200">
      <div class="prose prose-gray max-w-none">
        <div class="text-gray-700 leading-relaxed">
          {@html formatNarrative(aiNarrative)}
        </div>
      </div>
    </div>

    <!-- AI Insights as Bullet Points -->
    {#if aiInsights && aiInsights.length > 0}
      <div class="bg-white rounded-xl p-6 border border-gray-200">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span class="text-lg">💡</span>
          Strategische Aanbevelingen
        </h3>
        <div class="space-y-3">
          {#each aiInsights as insight}
            <div class="flex items-start gap-3">
              <span class="text-purple-600 text-sm mt-1 flex-shrink-0">▶</span>
              <p class="text-gray-700 text-sm leading-relaxed">{insight}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  {:else if hasAIContent && !aiNarrative}
    <!-- Empty State for Business/Enterprise without AI content -->
    <div class="bg-gray-50 rounded-xl p-8 border border-gray-200 text-center">
      <div class="text-4xl mb-4">🤖</div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        AI-Analyse wordt gegenereerd
      </h3>
      <p class="text-gray-600 max-w-md mx-auto">
        Je strategische AI-analyse wordt momenteel gegenereerd. Dit verschijnt binnen enkele minuten na je scan.
      </p>
    </div>
  {/if}

  <!-- Tier-specific additional context -->
  {#if hasAdvancedInsights}
    <div class="bg-blue-50 rounded-xl p-6 border border-blue-100">
      <div class="flex items-start gap-4">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-lg">📊</span>
        </div>
        <div>
          <h3 class="font-semibold text-blue-900 mb-2">
            {tier === 'enterprise' ? 'Enterprise Strategische Analyse' : 'Business Strategische Analyse'}
          </h3>
          <p class="text-blue-800 text-sm leading-relaxed">
            {#if tier === 'enterprise'}
              Deze analyse is specifiek afgestemd op enterprise-behoeften en bevat strategische KPI's en implementatie-roadmaps.
            {:else}
              Deze analyse bevat zakelijke strategieën en implementatie-aanbevelingen voor je business groei.
            {/if}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure proper text rendering */
  .prose {
    line-height: 1.6;
  }
  
  .prose p {
    margin-bottom: 1rem;
  }
  
  .prose strong {
    font-weight: 600;
  }
  
  .prose em {
    font-style: italic;
  }
  
  /* Smooth transitions */
  .filter {
    transition: filter 0.3s ease;
  }
  
  /* Focus styles for accessibility */
  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 4px;
  }
</style>