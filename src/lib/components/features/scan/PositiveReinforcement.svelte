<!-- src/lib/components/features/scan/PositiveReinforcement.svelte -->
<script lang="ts">
  export let positiveFindings: string[];
  export let showTitle: boolean = true;

  // Fallback positive messages if no findings
  const fallbackMessages = [
    'Website is technisch toegankelijk',
    'Basis SEO structuur aanwezig',
    'Site is goed leesbaar voor AI'
  ];

  $: displayFindings = positiveFindings.length > 0 ? positiveFindings : fallbackMessages.slice(0, 2);
</script>

{#if showTitle}
  <div class="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 mb-8">
    <div class="flex items-center gap-3 mb-4">
      <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
        <span class="text-lg">✅</span>
      </div>
      <h2 class="text-lg font-semibold text-green-800">
        Dit gaat al goed
      </h2>
    </div>
    
    <div class="space-y-2">
      {#each displayFindings as finding}
        <div class="flex items-center gap-3">
          <span class="text-green-600 text-sm">✓</span>
          <span class="text-green-700 text-sm font-medium">{finding}</span>
        </div>
      {/each}
    </div>

    {#if positiveFindings.length > 4}
      <div class="mt-3 text-xs text-green-600">
        En nog {positiveFindings.length - 4} andere sterke punten...
      </div>
    {/if}
  </div>
{:else}
  <!-- Compact version without title (for smaller spaces) -->
  <div class="space-y-2">
    {#each displayFindings as finding}
      <div class="flex items-center gap-2 text-sm">
        <span class="text-green-500">✓</span>
        <span class="text-green-700">{finding}</span>
      </div>
    {/each}
  </div>
{/if}