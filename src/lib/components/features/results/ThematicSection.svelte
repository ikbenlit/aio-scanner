<!-- src/lib/components/features/results/ThematicSection.svelte -->
<script lang="ts">
  import type { ThematicGroup } from '$lib/results/thematic-grouping';
  import type { Finding } from '$lib/types/scan';
  
  export let theme: ThematicGroup;
  export let isExpanded: boolean = false;
  
  // Toggle expansion
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
  
  // Get status styling
  function getStatusClasses(status: string): string {
    switch (status) {
      case 'excellent':
        return 'bg-green-50 border-green-200';
      case 'good':
        return 'bg-blue-50 border-blue-200';
      case 'needs_attention':
        return 'bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  }
  
  function getStatusTextClasses(status: string): string {
    switch (status) {
      case 'excellent':
        return 'text-green-800';
      case 'good':
        return 'text-blue-800';
      case 'needs_attention':
        return 'text-yellow-800';
      case 'critical':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  }
  
  function getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  }
  
  function getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'high':
        return 'Hoge prioriteit';
      case 'medium':
        return 'Gemiddelde prioriteit';
      case 'low':
        return 'Lage prioriteit';
      default:
        return 'Prioriteit onbekend';
    }
  }
  
  // Group findings by priority
  $: groupedFindings = {
    high: theme.findings.filter(f => f.priority === 'high'),
    medium: theme.findings.filter(f => f.priority === 'medium'),
    low: theme.findings.filter(f => f.priority === 'low')
  };
</script>

<!-- Thematic Section -->
<div id="theme-{theme.id}" class="bg-white rounded-xl border-2 {getStatusClasses(theme.status)} overflow-hidden">
  <!-- Section Header -->
  <button 
    class="w-full p-6 text-left hover:bg-opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
    on:click={toggleExpanded}
    aria-expanded={isExpanded}
    aria-controls="theme-{theme.id}-content"
  >
    <div class="flex items-center justify-between">
      <!-- Theme Info -->
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-full bg-white border-2 border-current flex items-center justify-center text-2xl">
          {theme.icon}
        </div>
        
        <div>
          <h2 class="text-xl font-bold {getStatusTextClasses(theme.status)} mb-1">
            {theme.name}
          </h2>
          <p class="text-sm text-gray-600 max-w-md">
            {theme.description}
          </p>
        </div>
      </div>
      
      <!-- Score & Status -->
      <div class="flex items-center gap-4">
        <!-- Score Display -->
        <div class="text-right">
          <div class="text-3xl font-bold {getStatusTextClasses(theme.status)}">
            {theme.score}
          </div>
          <div class="text-xs text-gray-500 uppercase tracking-wide">
            /100 punten
          </div>
        </div>
        
        <!-- Status Badge -->
        <div class="flex flex-col items-center gap-1">
          <div class="px-3 py-1 rounded-full text-xs font-semibold {getStatusClasses(theme.status)} {getStatusTextClasses(theme.status)} border">
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
          
          <!-- Expand/Collapse Indicator -->
          <div class="text-gray-400 transition-transform duration-200 {isExpanded ? 'rotate-180' : ''}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Summary (Always Visible) -->
    <div class="mt-4 flex items-center gap-6 text-sm text-gray-600">
      <span>
        📊 {theme.findings.length} bevinding{theme.findings.length !== 1 ? 'en' : ''}
      </span>
      {#if theme.quickFixes.length > 0}
        <span>
          ⚡ {theme.quickFixes.length} quick win{theme.quickFixes.length !== 1 ? 's' : ''}
        </span>
      {/if}
      <span>
        🎯 {theme.impact} impact
      </span>
    </div>
  </button>
  
  <!-- Expandable Content -->
  {#if isExpanded}
    <div id="theme-{theme.id}-content" class="border-t border-gray-200">
      <!-- Quick Fixes Section (if available) -->
      {#if theme.quickFixes.length > 0}
        <div class="p-6 bg-green-25 border-b border-gray-200">
          <div class="flex items-center gap-2 mb-4">
            <span class="text-xl">⚡</span>
            <h3 class="font-semibold text-gray-900">Snelle verbeteringen</h3>
            <span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Start hier
            </span>
          </div>
          
          <div class="grid gap-3">
            {#each theme.quickFixes as fix, index}
              <div class="flex items-start gap-3 p-4 bg-white rounded-lg border border-green-200">
                <div class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-700 leading-relaxed">{fix}</p>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Findings Section -->
      {#if theme.findings.length > 0}
        <div class="p-6">
          <div class="flex items-center gap-2 mb-6">
            <span class="text-xl">🔍</span>
            <h3 class="font-semibold text-gray-900">Gedetailleerde bevindingen</h3>
          </div>
          
          <!-- Priority Groups -->
          {#each Object.entries(groupedFindings) as [priority, findings]}
            {#if findings.length > 0}
              <div class="mb-6 last:mb-0">
                <!-- Priority Header -->
                <div class="flex items-center gap-2 mb-3">
                  <span class="text-lg">{getPriorityIcon(priority)}</span>
                  <h4 class="font-medium text-gray-900">{getPriorityLabel(priority)}</h4>
                  <span class="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {findings.length} item{findings.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <!-- Findings List -->
                <div class="space-y-3">
                  {#each findings as finding}
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div class="flex items-start justify-between mb-2">
                        <h5 class="font-medium text-gray-900 text-sm">
                          {finding.title}
                        </h5>
                        {#if finding.impact}
                          <span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                            Impact: {finding.impact}
                          </span>
                        {/if}
                      </div>
                      
                      <p class="text-sm text-gray-700 mb-3 leading-relaxed">
                        {finding.description}
                      </p>
                      
                      {#if finding.recommendation}
                        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div class="flex items-start gap-2">
                            <span class="text-blue-600 text-lg">💡</span>
                            <div>
                              <p class="text-xs font-medium text-blue-800 mb-1">Aanbeveling:</p>
                              <p class="text-sm text-blue-700">{finding.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      {/if}
                      
                      {#if finding.estimatedTime}
                        <div class="mt-2 text-xs text-gray-500">
                          ⏱️ Geschatte tijd: {finding.estimatedTime}
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {:else}
        <!-- No Issues Found -->
        <div class="p-6 text-center">
          <div class="text-4xl mb-2">🎉</div>
          <p class="text-gray-600 font-medium">Geen problemen gevonden!</p>
          <p class="text-sm text-gray-500 mt-1">Dit onderdeel van je website is goed geoptimaliseerd voor AI.</p>
        </div>
      {/if}
    </div>
  {/if}
</div> 