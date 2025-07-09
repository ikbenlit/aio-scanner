<!-- src/lib/components/features/scan/QuickWinsSection.svelte -->
<script lang="ts">
  import ActionCard from './ActionCard.svelte';
  import type { PrioritizedAction } from '$lib/results/prioritization';
  import type { ScanTier } from '$lib/types/scan';

  export let quickWins: PrioritizedAction[];
  export let totalActions: number = 0;
  export let tier: ScanTier;
  export let aiPreviewBadge: string | null = null;

  let expandedCards = new Set<string>();

  function handleCardExpand(event: CustomEvent<{ actionId: string; expanded: boolean }>) {
    const { actionId, expanded } = event.detail;
    
    if (expanded) {
      expandedCards.add(actionId);
    } else {
      expandedCards.delete(actionId);
    }
    expandedCards = expandedCards; // Trigger reactivity
  }

  // Tier-aware computed properties
  $: isBasicTier = tier === 'basic';
  $: hasMoreActions = totalActions > quickWins.length;
  $: moreActionsCount = totalActions - quickWins.length;

  // Calculate total time and impact
  $: totalTime = quickWins.reduce((sum, win) => {
    const timeNumber = parseInt(win.timeEstimate);
    return sum + timeNumber;
  }, 0);

  $: totalImpact = quickWins.reduce((sum, win) => {
    const impactNumber = parseInt(win.impactPoints.replace(/[^\d]/g, ''));
    return sum + impactNumber;
  }, 0);

  function formatTotalTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} uur`;
    }
    return `${hours}u ${remainingMinutes}m`;
  }
</script>

<div class="space-y-6">
  <!-- Section Header -->
  <div class="text-center">
    <div class="flex items-center justify-center gap-3 mb-3">
      <span class="text-2xl">🚀</span>
      <h2 class="text-2xl font-bold text-gray-900">
        {#if isBasicTier}
          {quickWins.length} Snelle Quick Wins
        {:else}
          {quickWins.length} Stappen om nog beter te worden
        {/if}
      </h2>
      {#if isBasicTier && aiPreviewBadge}
        <span class="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
          {aiPreviewBadge}
        </span>
      {/if}
    </div>
    
    <p class="text-gray-600 max-w-2xl mx-auto">
      {#if isBasicTier}
        Deze snelle acties zijn speciaal geselecteerd: 1 AI-actie plus de 2 hoogste impactvolle stappen.
      {:else}
        Deze acties hebben de grootste impact op je AI-vindbaarheid. Start waar je wilt - elke stap telt.
      {/if}
    </p>

    <!-- Quick stats -->
    {#if quickWins.length > 0}
      <div class="flex items-center justify-center gap-6 mt-4 text-sm text-gray-500">
        <div class="flex items-center gap-1">
          <span>⏱️</span>
          <span>Totaal: {formatTotalTime(totalTime)}</span>
        </div>
        <div class="flex items-center gap-1">
          <span>📈</span>
          <span>+{totalImpact} punten mogelijk</span>
        </div>
        {#if hasMoreActions}
          <div class="flex items-center gap-1">
            <span>💡</span>
            <span>
              {#if isBasicTier}
                {moreActionsCount} meer beschikbaar met upgrade
              {:else}
                {moreActionsCount} meer in volledig rapport
              {/if}
            </span>
          </div>
        {/if}
      </div>
    {/if}
  </div>

  <!-- Action Cards -->
  {#if quickWins.length > 0}
    <div class="grid gap-6 md:gap-8">
      {#each quickWins as action, index (action.id)}
        <ActionCard 
          {action} 
          {index}
          expanded={expandedCards.has(action.id)}
          on:expand={handleCardExpand}
        />
      {/each}
    </div>
  {:else}
    <!-- Empty state -->
    <div class="text-center py-12 bg-gray-50 rounded-xl">
      <div class="text-4xl mb-4">🎉</div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">
        Geweldig! Je website scoort al heel goed
      </h3>
      <p class="text-gray-600 max-w-md mx-auto">
        We hebben geen directe verbeterpunten gevonden. Je website is goed geoptimaliseerd voor AI-assistenten.
      </p>
    </div>
  {/if}

  <!-- Additional context for premium features -->
  {#if hasMoreActions && quickWins.length > 0}
    <div class="bg-blue-50 rounded-xl p-6 border border-blue-100">
      <div class="flex items-start gap-4">
        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
          <span class="text-lg">💡</span>
        </div>
        <div>
          <h3 class="font-semibold text-blue-900 mb-2">
            {#if isBasicTier}
              {moreActionsCount} meer acties beschikbaar
            {:else}
              Meer mogelijkheden beschikbaar
            {/if}
          </h3>
          <p class="text-blue-800 text-sm leading-relaxed">
            {#if isBasicTier}
              Deze {quickWins.length} acties zijn jouw snelle wins. Upgrade voor {moreActionsCount} andere optimalisaties, inclusief geavanceerde AI-strategieën en volledige technische analyses.
            {:else}
              Deze {quickWins.length} acties zijn de snelste wins. In het volledige rapport vind je nog {moreActionsCount} andere optimalisaties, inclusief geavanceerde AI-strategieën en technische verbeteringen.
            {/if}
          </p>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure smooth transitions on state changes */
  .grid {
    transition: gap 0.2s ease;
  }
</style>