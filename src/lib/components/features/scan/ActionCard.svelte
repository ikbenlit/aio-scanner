<!-- src/lib/components/features/scan/ActionCard.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { BusinessAction } from '$lib/results/translation';
  import { formatTimeEstimate } from '$lib/results/prioritization';

  export let action: BusinessAction;
  export let index: number;
  export let expanded: boolean = false;

  const dispatch = createEventDispatcher<{ expand: { actionId: string; expanded: boolean } }>();

  $: timeFormatted = formatTimeEstimate(action.timeEstimate);
  
  function toggleExpanded() {
    expanded = !expanded;
    dispatch('expand', { actionId: action.id, expanded });
  }

  function getDifficultyClasses(difficulty: string): string {
    switch (difficulty) {
      case 'makkelijk':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'gemiddeld':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'uitdagend':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }

  function getDifficultyIcon(difficulty: string): string {
    switch (difficulty) {
      case 'makkelijk':
        return '🟢';
      case 'gemiddeld':
        return '🟡';
      case 'uitdagend':
        return '🔴';
      default:
        return '⚪';
    }
  }
</script>

<div class="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
  <!-- Card Header -->
  <div class="p-6">
    <!-- Action number and title -->
    <div class="flex items-start gap-4 mb-4">
      <div class="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
        {index + 1}
      </div>
      <div class="flex-1 min-w-0">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {action.title}
        </h3>
        <p class="text-gray-600 text-sm leading-relaxed">
          {action.why}
        </p>
      </div>
    </div>

    <!-- Action details -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <span class="text-sm font-medium text-gray-700">Hoe:</span>
        <span class="text-sm text-gray-600">{action.how}</span>
      </div>
    </div>

    <!-- Time, impact and difficulty -->
    <div class="flex flex-wrap items-center gap-3 mb-4">
      <!-- Time estimate -->
      <div class="flex items-center gap-1">
        <span class="text-lg">{timeFormatted.icon}</span>
        <span class="text-sm font-medium text-gray-700">{action.timeEstimate}</span>
      </div>

      <!-- Impact points -->
      <div class="flex items-center gap-1">
        <span class="text-lg">📈</span>
        <span class="text-sm font-medium text-green-600">{action.impactPoints}</span>
      </div>

      <!-- Difficulty badge -->
      <div class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border {getDifficultyClasses(action.difficulty)}">
        <span>{getDifficultyIcon(action.difficulty)}</span>
        <span class="capitalize">{action.difficulty}</span>
      </div>
    </div>

    <!-- Expand/Collapse button -->
    <button
      class="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
      on:click={toggleExpanded}
    >
      <span>{expanded ? 'Minder details' : 'Meer details'}</span>
      <svg 
        class="w-4 h-4 transition-transform duration-200 {expanded ? 'rotate-180' : ''}" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </button>
  </div>

  <!-- Expanded Details -->
  {#if expanded && action.expandedDetails}
    <div class="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
      <!-- Step-by-step instructions -->
      {#if action.expandedDetails.steps && action.expandedDetails.steps.length > 0}
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span class="text-lg">📋</span>
            Stap-voor-stap:
          </h4>
          <ol class="space-y-2">
            {#each action.expandedDetails.steps as step, stepIndex}
              <li class="flex items-start gap-3">
                <span class="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                  {stepIndex + 1}
                </span>
                <span class="text-sm text-gray-700 leading-relaxed">{step}</span>
              </li>
            {/each}
          </ol>
        </div>
      {/if}

      <!-- Why it works explanation -->
      {#if action.expandedDetails.whyItWorks}
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span class="text-lg">💡</span>
            Waarom werkt dit?
          </h4>
          <p class="text-sm text-gray-700 leading-relaxed bg-white p-3 rounded border-l-4 border-blue-200">
            {action.expandedDetails.whyItWorks}
          </p>
        </div>
      {/if}

      <!-- Examples -->
      {#if action.expandedDetails.examples && action.expandedDetails.examples.length > 0}
        <div>
          <h4 class="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <span class="text-lg">✨</span>
            Voorbeelden:
          </h4>
          <div class="space-y-2">
            {#each action.expandedDetails.examples as example}
              <div class="bg-white p-3 rounded border border-gray-200">
                <code class="text-sm text-gray-800 font-mono">{example}</code>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Original technical finding (for debugging/reference) -->
      {#if action.originalFinding && process.env.NODE_ENV === 'development'}
        <details class="mt-4">
          <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
            🔧 Technische details (debug)
          </summary>
          <div class="mt-2 p-3 bg-white border rounded text-xs text-gray-600">
            <div><strong>Original:</strong> {action.originalFinding.title}</div>
            <div><strong>Category:</strong> {action.originalFinding.category || 'N/A'}</div>
            <div><strong>Priority:</strong> {action.originalFinding.priority}</div>
          </div>
        </details>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Smooth expand/collapse animation */
  .expand-content {
    overflow: hidden;
    transition: max-height 0.3s ease-out;
  }
  
  /* Focus styles for accessibility */
  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }
</style>