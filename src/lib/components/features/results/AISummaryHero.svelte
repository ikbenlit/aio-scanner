<!-- src/lib/components/features/results/AISummaryHero.svelte -->
<script lang="ts">
  export let motivationalMessage: string;
  export let keyPriorities: string[];
  export let benchmarkMessage: string;
  export let nextSteps: string[];
  export let overallScore: number;
  export let url: string;
  
  // Get score status for styling
  function getScoreStatus(score: number): { color: string; label: string; emoji: string } {
    if (score >= 80) return { color: 'text-green-600', label: 'Uitstekend', emoji: '🎉' };
    if (score >= 60) return { color: 'text-blue-600', label: 'Goed', emoji: '✅' };
    if (score >= 40) return { color: 'text-yellow-600', label: 'Kan beter', emoji: '📈' };
    return { color: 'text-red-600', label: 'Actie nodig', emoji: '🚀' };
  }
  
  $: scoreStatus = getScoreStatus(overallScore);
</script>

<!-- AI Summary Hero Section -->
<div class="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-xl p-6 lg:p-8 border border-blue-100 mb-8">
  <!-- Header with Score -->
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
    <div class="mb-4 lg:mb-0">
      <h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
        AI Optimalisatie Rapport
      </h1>
      <p class="text-gray-600">voor <span class="font-medium">{url}</span></p>
    </div>
    
    <!-- Overall Score Display -->
    <div class="flex items-center gap-4">
      <div class="text-center">
        <div class="text-4xl lg:text-5xl font-bold {scoreStatus.color} mb-1">
          {overallScore}
        </div>
        <div class="text-sm text-gray-500 uppercase tracking-wide">
          van 100 punten
        </div>
      </div>
      <div class="text-center">
        <div class="text-2xl mb-1">{scoreStatus.emoji}</div>
        <div class="text-sm font-medium {scoreStatus.color}">
          {scoreStatus.label}
        </div>
      </div>
    </div>
  </div>
  
  <!-- AI Generated Motivational Message -->
  <div class="bg-white rounded-lg p-6 mb-6 border border-gray-100">
    <div class="flex items-start gap-3 mb-4">
      <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
        <span class="text-lg">🧠</span>
      </div>
      <div>
        <h3 class="font-semibold text-gray-900 mb-1">AI Analyse</h3>
        <p class="text-gray-600 text-sm">Persoonlijke samenvatting voor jouw website</p>
      </div>
    </div>
    
    <p class="text-lg leading-relaxed text-gray-800 mb-4">
      {motivationalMessage}
    </p>
    
    <div class="bg-gray-50 rounded-lg p-4">
      <p class="text-sm text-gray-600 italic">
        {benchmarkMessage}
      </p>
    </div>
  </div>
  
  <!-- Key Priorities & Next Steps Grid -->
  <div class="grid lg:grid-cols-2 gap-6">
    <!-- Key Priorities -->
    {#if keyPriorities.length > 0}
      <div class="bg-white rounded-lg p-5 border border-gray-100">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-xl">🎯</span>
          <h3 class="font-semibold text-gray-900">Belangrijkste aandachtspunten</h3>
        </div>
        
        <div class="space-y-3">
          {#each keyPriorities as priority}
            <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
              <span class="text-sm text-gray-700">{priority}</span>
            </div>
          {/each}
        </div>
      </div>
    {/if}
    
    <!-- Next Steps -->
    {#if nextSteps.length > 0}
      <div class="bg-white rounded-lg p-5 border border-gray-100">
        <div class="flex items-center gap-2 mb-4">
          <span class="text-xl">⚡</span>
          <h3 class="font-semibold text-gray-900">Snelle verbeteringen</h3>
        </div>
        
        <div class="space-y-3">
          {#each nextSteps as step, index}
            <div class="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <div class="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {index + 1}
              </div>
              <span class="text-sm text-gray-700 leading-relaxed">{step}</span>
            </div>
          {/each}
        </div>
        
        <div class="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p class="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Begin met stap 1 voor de grootste impact op je AI-vindbaarheid.
          </p>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Call to Action -->
  <div class="mt-6 text-center">
    <p class="text-sm text-gray-600 mb-4">
      Scroll naar beneden voor gedetailleerde analyse per thema
    </p>
    <button 
      on:click={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      <span>Bekijk volledige analyse</span>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    </button>
  </div>
</div> 