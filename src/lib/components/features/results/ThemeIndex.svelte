<!-- src/lib/components/features/results/ThemeIndex.svelte -->
<script lang="ts">
  import type { ThematicGroup } from '$lib/results/thematic-grouping';
  
  export let themes: ThematicGroup[];
  export let activeTheme: string = '';
  
  // Scroll to specific theme section
  function scrollToTheme(themeId: string) {
    const element = document.getElementById(`theme-${themeId}`);
    if (element) {
      const offset = 120; // Account for sticky header
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  }
  
  // Get status color classes
  function getStatusClasses(status: string): string {
    switch (status) {
      case 'excellent':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'good':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'needs_attention':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  }
  
  // Get score badge color
  function getScoreBadgeClasses(score: number): string {
    if (score >= 85) return 'bg-green-600 text-white';
    if (score >= 70) return 'bg-blue-600 text-white';
    if (score >= 50) return 'bg-yellow-600 text-white';
    return 'bg-red-600 text-white';
  }
</script>

<!-- Sticky Theme Navigation -->
<div class="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="py-4">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">AI Optimalisatie Overzicht</h2>
        <div class="text-sm text-gray-500">Klik op een thema om naar de sectie te springen</div>
      </div>
      
      <!-- Theme Navigation Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {#each themes as theme}
          <button
            class="group relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {getStatusClasses(theme.status)} {activeTheme === theme.id ? 'ring-2 ring-blue-500' : ''}"
            on:click={() => scrollToTheme(theme.id)}
            aria-label="Ga naar {theme.name} sectie"
          >
            <!-- Theme Icon & Title -->
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xl" aria-hidden="true">{theme.icon}</span>
                <span class="font-medium text-sm">{theme.name}</span>
              </div>
              
              <!-- Score Badge -->
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {getScoreBadgeClasses(theme.score)}">
                {theme.score}
              </span>
            </div>
            
            <!-- Status Indicator -->
            <div class="text-xs opacity-75 mb-1">
              {#if theme.status === 'excellent'}
                ✅ Uitstekend
              {:else if theme.status === 'good'}
                👍 Goed
              {:else if theme.status === 'needs_attention'}
                ⚠️ Aandacht nodig
              {:else if theme.status === 'critical'}
                🚨 Kritiek
              {/if}
            </div>
            
            <!-- Quick Summary -->
            <div class="text-xs opacity-60">
              {#if theme.findings.length > 0}
                {theme.findings.length} punt{theme.findings.length !== 1 ? 'en' : ''}
                {#if theme.quickFixes.length > 0}
                  • {theme.quickFixes.length} quick win{theme.quickFixes.length !== 1 ? 's' : ''}
                {/if}
              {:else}
                Geen issues gevonden
              {/if}
            </div>
            
            <!-- Hover Arrow -->
            <div class="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg class="w-4 h-4 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div> 