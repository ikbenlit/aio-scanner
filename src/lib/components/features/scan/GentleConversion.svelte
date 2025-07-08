<!-- src/lib/components/features/scan/GentleConversion.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import type { ScanTier } from '$lib/types/database';

  export let tier: ScanTier = 'basic';
  export let quickWinsCount: number = 3;
  export let totalActionsCount: number = 5;
  export let placement: 'after-positive' | 'after-quickwins' | 'bottom' = 'after-quickwins';

  // Calculate remaining actions
  $: remainingActions = Math.max(0, totalActionsCount - quickWinsCount);

  // Get tier-specific messaging
  function getTierMessaging(currentTier: ScanTier) {
    switch (currentTier) {
      case 'basic':
        return {
          title: 'Wil je het complete implementatie rapport?',
          teaser: `Deze ${quickWinsCount} stappen zijn nog maar het begin. Er zijn nog ${remainingActions} andere optimalisaties gevonden...`,
          value: 'Krijg een compleet overzicht met alle verbeterstappen + tijdsinschattingen',
          cta: 'Download Volledig Rapport',
          ctaSecondary: 'Bekijk alle beschikbare acties',
          benefits: [
            'Stap-voor-stap implementatie gids',
            'Prioritering op basis van impact',
            'Tijdsinschattingen per actie',
            'Technische uitleg waar nodig'
          ]
        };
      case 'starter':
        return {
          title: 'Ontdek nog meer optimalisatie mogelijkheden',
          teaser: 'Je starter scan heeft al veel inzichten opgeleverd. Upgrade voor nog diepere analyse.',
          value: 'Business-tier rapport met AI-strategieën en concurrentie-analyse',
          cta: 'Upgrade naar Business',
          ctaSecondary: 'Zie Business voordelen',
          benefits: [
            'Geavanceerde AI-content strategieën',
            'Concurrentie benchmark analyse',
            'Cross-platform autoriteit tips',
            'Gedetailleerde implementatie roadmap'
          ]
        };
      case 'business':
        return {
          title: 'PDF rapport is klaar voor download',
          teaser: 'Je volledige business analyse is beschikbaar als professioneel PDF rapport.',
          value: 'Deel met je team of gebruik als implementatie checklist',
          cta: 'Download PDF Rapport',
          ctaSecondary: 'Email rapport naar mezelf',
          benefits: [
            'Professioneel geformateerd rapport',
            'Print-vriendelijke layout',
            'Uitgebreide implementatie gids',
            'Makkelijk te delen met team'
          ]
        };
      default:
        return {
          title: 'Meer inzichten beschikbaar',
          teaser: 'Deze analyse toont de belangrijkste verbeterpunten.',
          value: 'Upgrade voor diepere inzichten en meer acties',
          cta: 'Bekijk opties',
          ctaSecondary: 'Leer meer',
          benefits: []
        };
    }
  }

  $: messaging = getTierMessaging(tier);

  // Get placement-specific styling
  function getPlacementClasses(currentPlacement: string): string {
    switch (currentPlacement) {
      case 'after-positive':
        return 'bg-blue-50 border-blue-200';
      case 'after-quickwins':
        return 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200';
      case 'bottom':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  }

  $: placementClasses = getPlacementClasses(placement);

  function handlePrimaryCTA() {
    // Track conversion intent
    if (tier === 'basic') {
      // Navigate to pricing or scan upgrade
      window.location.href = '/pricing?from=results&tier=starter';
    } else if (tier === 'starter') {
      window.location.href = '/pricing?from=results&tier=business';
    } else if (tier === 'business') {
      // Download PDF or email report
      // This would trigger the PDF generation/email flow
      console.log('Download PDF report');
    }
  }

  function handleSecondaryCTA() {
    if (tier === 'basic') {
      // Show more details about what's included
      console.log('Show detailed feature comparison');
    } else if (tier === 'starter') {
      window.location.href = '/features/business';
    } else if (tier === 'business') {
      // Email report option
      console.log('Email report to user');
    }
  }
</script>

<div class="rounded-xl p-6 border {placementClasses} transition-all duration-200 hover:shadow-sm">
  <!-- Icon and Title -->
  <div class="flex items-start gap-4 mb-4">
    <div class="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
      {#if tier === 'business'}
        <span class="text-xl">📄</span>
      {:else}
        <span class="text-xl">📊</span>
      {/if}
    </div>
    <div class="flex-1">
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        {messaging.title}
      </h3>
      <p class="text-gray-700 text-sm leading-relaxed">
        {messaging.teaser}
      </p>
    </div>
  </div>

  <!-- Value proposition -->
  <div class="mb-4 pl-14">
    <p class="text-gray-600 text-sm font-medium">
      {messaging.value}
    </p>
  </div>

  <!-- Benefits list (if any) -->
  {#if messaging.benefits.length > 0}
    <div class="mb-6 pl-14">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        {#each messaging.benefits as benefit}
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <span class="text-green-500 text-xs">✓</span>
            <span>{benefit}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <!-- CTA Buttons -->
  <div class="flex flex-col sm:flex-row gap-3 pl-14">
    <Button 
      class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm font-medium"
      on:click={handlePrimaryCTA}
    >
      {messaging.cta}
    </Button>
    
    <Button 
      variant="outline" 
      class="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2 text-sm"
      on:click={handleSecondaryCTA}
    >
      {messaging.ctaSecondary}
    </Button>
  </div>

  <!-- Social proof (subtle) -->
  {#if tier === 'basic'}
    <div class="mt-4 pl-14 text-xs text-gray-500">
      500+ ondernemers gebruikten al het volledige rapport voor betere AI-vindbaarheid
    </div>
  {/if}
</div>

<!-- Conditional: Show PDF preview teaser for basic tier -->
{#if tier === 'basic' && placement === 'after-quickwins'}
  <div class="mt-4 flex items-center justify-center">
    <button 
      class="group flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      on:click={() => console.log('Show PDF preview modal')}
    >
      <span>👀</span>
      <span class="group-hover:underline">Krijg een voorproefje van het volledige rapport</span>
      <svg class="w-3 h-3 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
      </svg>
    </button>
  </div>
{/if}

<style>
  /* Subtle animation on hover */
  .hover\:shadow-sm:hover {
    transition: box-shadow 0.2s ease;
  }
  
  /* Focus styles for accessibility */
  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 4px;
  }
</style>