<!-- Email Capture Modal - Maximum Leverage Conversion Moment -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Button } from '$lib/components/ui/button';
  import type { ScanResult } from '$lib/scan/types';
  
  // Props
  export let scanResults: ScanResult;
  export let isOpen = false;
  
  // Local state
  let email = '';
  let isSubmitting = false;
  let error = '';
  
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
  
  function getTopFindings(results: ScanResult) {
    // Extract top 2 most impactful findings across all modules
    const allFindings = results.moduleResults.flatMap(module => 
      module.findings.filter(finding => finding.impact === 'high' || finding.impact === 'medium')
    );
    
    return allFindings.slice(0, 2);
  }
  
  async function handleSubmit() {
    if (!email.trim()) {
      error = 'Email adres is verplicht';
      return;
    }
    
    if (!isValidEmail(email)) {
      error = 'Voer een geldig email adres in';
      return;
    }
    
    error = '';
    isSubmitting = true;
    
    try {
      dispatch('submit', { email: email.trim() });
    } catch (err) {
      error = 'Er is een fout opgetreden. Probeer het opnieuw.';
      isSubmitting = false;
    }
  }
  
  function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function handleClose() {
    if (!isSubmitting) {
      dispatch('close');
    }
  }
</script>

{#if isOpen}
  <!-- Modal Backdrop -->
  <div 
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    on:click|self={handleClose}
    role="dialog" 
    aria-modal="true"
  >
    <!-- Modal Content -->
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      
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
      </div>
      
      <!-- Preview: Partial Reveal -->
      <div class="p-6">
        <!-- Top Findings Preview -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">🔍 Gevonden punten:</h3>
          
          {#if topFindings.length > 0}
            <div class="space-y-3">
              {#each topFindings as finding}
                <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div class="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center">
                    {#if finding.type === 'error'}
                      <span class="text-red-600 text-sm">⚠️</span>
                    {:else if finding.type === 'warning'} 
                      <span class="text-yellow-600 text-sm">⚡</span>
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
        </div>
        
        <!-- Email Form -->
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-900 mb-2">
              📧 Email voor volledige resultaten:
            </label>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="jouw.email@bedrijf.nl"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={isSubmitting}
            />
            {#if error}
              <p class="text-red-600 text-sm mt-2">{error}</p>
            {/if}
          </div>
          
          <!-- Submit Button -->
          <Button 
            on:click={handleSubmit} 
            disabled={isSubmitting || !email.trim()}
            class="w-full py-3 text-base font-semibold"
            size="lg"
          >
            {#if isSubmitting}
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Bezig met verwerken...
            {:else}
              🚀 Bekijk Volledige Resultaten
            {/if}
          </Button>
        </div>
        
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
  </div>
{/if}

<style>
  /* Ensure proper stacking */
  :global(body:has(.fixed.inset-0)) {
    overflow: hidden;
  }
</style> 