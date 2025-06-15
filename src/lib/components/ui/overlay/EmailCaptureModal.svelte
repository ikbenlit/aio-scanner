+13
-85

<!-- Email Capture Modal - Maximum Leverage Conversion Moment -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { BackgroundOverlay } from '$lib/components/ui/overlay';
  import EmailForm from '../../features/scan/EmailForm.svelte';
  import type { EngineScanResult } from '$lib/types/scan';
  
  // Props
  export let scanResults: EngineScanResult;
  export let isOpen = false;
  // Event dispatcher
  const dispatch = createEventDispatcher<{
    submit: { email: string };
    close: void;
  }>();
  
  // Computed properties
  $: statusLabel = getStatusLabel(scanResults.overallScore);
  $: statusColor = getStatusColor(scanResults.overallScore);
  $: topFindings = getTopFindings(scanResults);
  
  function getStatusLabel(score: number): string {
    if (score >= 80) return 'Uitstekend';
    if (score >= 60) return 'Goed';
    if (score >= 40) return 'Matig';
    return 'Aandacht nodig';
  }
  
  function getStatusColor(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  function getTopFindings(results: EngineScanResult) {
    // Extract top 2 most impactful findings across all modules
    // TODO: Add proper typing for module and finding parameters (MVP: any types acceptable)
    const allFindings = results.moduleResults.flatMap((module: any) => 
      module.findings.filter((finding: any) => finding.impact === 'high' || finding.impact === 'medium')
    );
    
    return allFindings.slice(0, 2);
  }
  
  function handleEmailSubmit(event: CustomEvent<string>) {
    dispatch('submit', { email: event.detail });
  }

  function handleClose() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <BackgroundOverlay {isOpen} on:close={handleClose}>
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true">
      <!-- Header: Achievement State -->
      <div class="p-6 border-b border-gray-100">
        <div class="text-center">
          <!-- Success Icon -->
          <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <!-- Title -->
          <h2 class="text-2xl font-bold text-gray-900 mb-2">
            ✅ Scan Voltooid!
          </h2>
          
          <!-- Website & Score -->
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-2">{scanResults.url}</p>
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full">
              <span class="text-2xl font-bold text-gray-900">{scanResults.overallScore}</span>
              <span class="text-sm text-gray-600">/100</span>
              <span class="text-sm {statusColor} font-medium">{statusLabel}</span>
            </div>
          </div>
        </div>

        <!-- Top Findings Preview -->
        {#if topFindings.length > 0}
          <div class="mt-6">
            <h3 class="text-sm font-medium text-gray-900 mb-3">Top Bevindingen:</h3>
            <div class="space-y-3">
              {#each topFindings as finding}
                <div class="flex items-start gap-3">
                  <div class="flex-shrink-0 mt-1">
                    {#if finding.impact === 'high'}
                      <span class="text-red-600 text-sm">⚠️</span>
                    {:else}
                      <span class="text-green-600 text-sm">✅</span>
                    {/if}
                  </div>
                  <div>
                    <p class="font-medium text-sm text-gray-900">{finding.title}</p>
                    <p class="text-xs text-gray-600 mt-1">{finding.description}</p>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        {/if}
        
        <!-- Curiosity Gap: More Findings -->
        <div class="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div class="flex items-center gap-2">
            <span class="text-lg">🔒</span>
            <span class="font-medium text-gray-900">+ 3 andere kritieke punten</span>
          </div>
          <p class="text-sm text-gray-600 mt-1">
            Inclusief AI-optimalisatie tips en concurrentie analyse
          </p>
        </div>
        
        <!-- Email Form -->
        <EmailForm on:submit={handleEmailSubmit} />
        
        <!-- Trust Signals -->
        <div class="mt-6 pt-4 border-t border-gray-100">
          <div class="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path>
              </svg>
              GDPR Compliant
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
              </svg>
              Geen spam
            </div>
            <div class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              1x gebruik
            </div>
          </div>
        </div>
      </div>
    </div>
  </BackgroundOverlay>
{/if}

<style>
  /* Ensure proper stacking when modal is open */
  :global(body:has(.aio-overlay)) {
    overflow: hidden;
  }
</style>