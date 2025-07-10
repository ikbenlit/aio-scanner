<!-- src/lib/components/features/results/SmartFindingCard.svelte -->
<script lang="ts">
  import type { Finding } from '$lib/types/scan';

  // Extend Finding type for smart findings
  interface SmartFinding extends Finding {
    evidence?: string[];
    suggestion?: string;
  }

  export let finding: SmartFinding;
  export let expanded: boolean = false;

  function toggleExpanded() {
    expanded = !expanded;
  }

  function getPriorityClasses(priority: 'high' | 'medium' | 'low'): string {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  function getPriorityIcon(priority: 'high' | 'medium' | 'low'): string {
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

  // Check if this is a "smart" finding with evidence or suggestions
  $: hasSmartData = (finding.evidence && finding.evidence.length > 0) || !!finding.suggestion;
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
  <!-- Card Header -->
  <div class="p-6">
    <!-- Title and description -->
    <div class="mb-4">
      <div class="flex items-start justify-between gap-4 mb-3">
        <h3 class="text-lg font-semibold text-gray-900 flex-1">
          {finding.title}
        </h3>
        
        <!-- Priority badge -->
        <div class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border {getPriorityClasses(finding.priority)}">
          <span>{getPriorityIcon(finding.priority)}</span>
          <span class="capitalize">{finding.priority}</span>
        </div>
      </div>
      
      <p class="text-gray-600 text-sm leading-relaxed">
        {finding.description}
      </p>
    </div>

    <!-- Basic recommendation if available -->
    {#if finding.recommendation}
      <div class="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-200">
        <p class="text-sm text-blue-800">
          <strong>Aanbeveling:</strong> {finding.recommendation}
        </p>
      </div>
    {/if}

    <!-- Show expand button only if we have evidence or suggestions -->
    {#if hasSmartData}
      <button
        class="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
        on:click={toggleExpanded}
      >
        <span class="text-lg">💡</span>
        <span>{expanded ? 'Verberg details' : 'Toon details & suggestie'}</span>
        <svg 
          class="w-4 h-4 transition-transform duration-200 {expanded ? 'rotate-180' : ''}" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
    {/if}
  </div>

  <!-- Expanded Smart Content -->
  {#if expanded && hasSmartData}
    <div class="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
      <!-- Evidence section -->
      {#if finding.evidence && finding.evidence.length > 0}
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span class="text-lg">📋</span>
            Gevonden in uw content:
          </h4>
          <div class="space-y-3">
            {#each finding.evidence.slice(0, 3) as evidence}
              <blockquote class="bg-white p-3 rounded border-l-4 border-gray-300 text-sm text-gray-700 italic">
                "{evidence}"
              </blockquote>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Suggestion section -->
      {#if finding.suggestion}
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span class="text-lg">💡</span>
            Concrete suggestie:
          </h4>
          <div class="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p class="text-sm text-amber-800 leading-relaxed">
              {finding.suggestion}
            </p>
          </div>
        </div>
      {/if}

      <!-- Technical details if available -->
      {#if finding.technicalDetails}
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span class="text-lg">🔧</span>
            Technische details:
          </h4>
          <div class="bg-white p-3 rounded border border-gray-200">
            <code class="text-sm text-gray-800 font-mono whitespace-pre-wrap">{finding.technicalDetails}</code>
          </div>
        </div>
      {/if}

      <!-- Estimated time if available -->
      {#if finding.estimatedTime}
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="text-lg">⏱️</span>
          <span><strong>Geschatte tijd:</strong> {finding.estimatedTime}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Focus styles for accessibility */
  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
  
  /* Blockquote styling */
  blockquote {
    position: relative;
  }
  
  blockquote::before {
    content: '"';
    position: absolute;
    left: -8px;
    top: -2px;
    font-size: 1.5em;
    color: #9ca3af;
    font-weight: bold;
  }
</style>