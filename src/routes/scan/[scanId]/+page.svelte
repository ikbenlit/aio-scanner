<!-- src/routes/scan/[scanId]/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/layout/Header.svelte';
  import ModuleProgressGrid from '$lib/components/features/scan/ModuleProgressGrid.svelte';
  import ActivityLog from '$lib/components/features/scan/ActivityLog.svelte';
  import ProgressCircle from '$lib/components/features/scan/ProgressCircle.svelte';
  import WebsitePreview from '$lib/components/features/scan/WebsitePreview.svelte';
  import EmailCaptureModal from '$lib/components/features/email/EmailCaptureModal.svelte';
  import { Button } from '$lib/components/ui/button';
  import { getSupabaseClient } from '$lib/supabase.js';
  import type { FlowAction } from '$lib/scan/completion';
  import type { ScanResult } from '$lib/scan/types';
  import EmailCaptureForm from '$lib/components/features/email/EmailCaptureForm.svelte';
  import EmailVerification from '$lib/components/features/email/EmailVerification.svelte';

  // Get scanId from URL
  const scanId = $page.params.scanId;
  const urlToScan = $page.url.searchParams.get('url') || 'jouwwebsite.nl';

  // Reactive state
  let scanStatus: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
  let scanProgress = 0;
  let estimatedTime = 30;
  let overallScore = 0;
  let showEmailModal = false;
  let scanResults: ScanResult | null = null;
  let error = '';
  
  // Get Supabase client instance
  const supabase = getSupabaseClient();
  
  // Polling interval
  let pollInterval: ReturnType<typeof setInterval>;
  
  // Module progress tracking
  let modules: Array<{ 
    id: string; 
    name: string; 
    icon: string; 
    status: 'pending' | 'scanning' | 'complete'; 
    score: number; 
  }> = [
    { id: 'technical', name: 'Technical SEO', icon: '🔍', status: 'pending', score: 0 },
    { id: 'schema', name: 'Schema Markup', icon: '📝', status: 'pending', score: 0 },
    { id: 'ai_content', name: 'AI Content', icon: '🤖', status: 'pending', score: 0 },
    { id: 'ai_citation', name: 'AI Citation', icon: '🏆', status: 'pending', score: 0 }
  ];

  let activityItems: Array<{ text: string; status: 'success' | 'pending' | 'error' }> = [
    { text: 'Scan gestart...', status: 'pending' }
  ];

  onMount(() => {
    // Start polling scan status
    pollScanStatus();
    pollInterval = setInterval(pollScanStatus, 2000); // Poll every 2 seconds
  });

  onDestroy(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });

  async function pollScanStatus() {
    try {
      // Call the GET API endpoint for real scan status
      const response = await fetch(`/api/scan/anonymous?scanId=${scanId}`);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Update scan status from API response
      scanStatus = data.status;
      scanProgress = data.progress || 0;
      overallScore = data.overallScore || 0;
      
      // Update estimated time based on progress
      if (scanStatus === 'pending') {
        estimatedTime = 30;
        activityItems = [{ text: 'Scan wordt voorbereid...', status: 'pending' }];
      } else if (scanStatus === 'running') {
        estimatedTime = Math.max(5, Math.round(30 - (scanProgress / 100) * 30));
        
        // Update activity log based on progress
        updateActivityLog(scanProgress);
        
        // Update module progress based on results
        if (data.results && data.results.moduleResults) {
          updateModuleProgress(data.results.moduleResults);
        }
      } else if (scanStatus === 'completed') {
        scanProgress = 100;
        estimatedTime = 0;
        
        // Final activity log
        activityItems = [
          { text: 'Content geanalyseerd', status: 'success' },
          { text: 'Technical SEO voltooid', status: 'success' },
          { text: 'Schema markup gedetecteerd', status: 'success' },
          { text: 'Rapport gegenereerd', status: 'success' }
        ];

        // Stop polling and handle completion
        clearInterval(pollInterval);
        await handleScanCompletion();
      } else if (scanStatus === 'failed') {
        error = 'Scan mislukt. Probeer het opnieuw.';
        clearInterval(pollInterval);
      }

    } catch (err) {
      console.error('Polling error:', err);
      // Don't stop polling on temporary errors, just log them
    }
  }

  function updateActivityLog(progress: number) {
    if (progress >= 5 && progress < 25) {
      activityItems = [
        { text: 'Technical SEO analyse...', status: 'pending' }
      ];
    } else if (progress >= 25 && progress < 50) {
      activityItems = [
        { text: 'Technical SEO voltooid', status: 'success' },
        { text: 'Schema markup detectie...', status: 'pending' }
      ];
    } else if (progress >= 50 && progress < 75) {
      activityItems = [
        { text: 'Technical SEO voltooid', status: 'success' },
        { text: 'Schema markup voltooid', status: 'success' },
        { text: 'AI Content analyse...', status: 'pending' }
      ];
    } else if (progress >= 75 && progress < 95) {
      activityItems = [
        { text: 'Technical SEO voltooid', status: 'success' },
        { text: 'Schema markup voltooid', status: 'success' },
        { text: 'AI Content analyse voltooid', status: 'success' },
        { text: 'AI Citation analyse...', status: 'pending' }
      ];
    } else if (progress >= 95 && progress < 100) {
      activityItems = [
        { text: 'Technical SEO voltooid', status: 'success' },
        { text: 'Schema markup voltooid', status: 'success' },
        { text: 'AI Content analyse voltooid', status: 'success' },
        { text: 'AI Citation analyse voltooid', status: 'success' },
        { text: 'Rapport wordt gegenereerd...', status: 'pending' }
      ];
    }
  }

  function updateModuleProgress(moduleResults: any[]) {
    // Map API module results to frontend module display
    const moduleMap: {[key: string]: string} = {
      'Technical SEO': 'technical',
      'Schema Markup': 'schema',
      'AI Content': 'ai_content',
      'AI Citation': 'ai_citation'
    };

    modules = modules.map(module => {
      // Find corresponding result from API
      const result = moduleResults.find(r => 
        moduleMap[r.moduleName] === module.id || 
        r.moduleName.toLowerCase().includes(module.id.replace('_', ''))
      );

      if (result) {
        return {
          ...module,
          status: result.status === 'completed' ? 'complete' : 
                  result.status === 'failed' ? 'complete' : 'scanning',
          score: result.score || 0
        };
      }

      return module;
    });
  }

  async function handleScanCompletion() {
    try {
      console.log('Scan completed, triggering completion flow');
      
      const response = await fetch('/api/scan/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId })
      });

      if (!response.ok) {
        throw new Error('Failed to process scan completion');
      }

      const data = await response.json();
      const action: FlowAction = data.action;

      // Handle different flow actions
      switch (action.type) {
        case 'show_results':
          // Authenticated user with credits - direct to results
          goto(`/scan/${scanId}/results`);
          break;

        case 'show_upgrade_prompt':
          // Authenticated user without credits - upgrade prompt
          goto('/upgrade?reason=no_credits');
          break;

        case 'show_email_capture':
          // Anonymous user - show email capture modal
          scanResults = data.scanResults;
          showEmailModal = true;
          break;

        case 'error':
          error = action.message;
          break;

        default:
          console.error('Unknown flow action:', action);
          error = 'Er is een onbekende fout opgetreden';
      }

    } catch (err) {
      console.error('Scan completion error:', err);
      error = 'Er is een fout opgetreden bij het voltooien van de scan';
    }
  }

  function handleEmailModalClose() {
    showEmailModal = false;
    // For now, allow closing. In production, consider limiting this.
  }

  function cancelScan() {
    // TODO: Implement scan cancellation
    goto('/');
  }
</script>

<svelte:head>
  <title>Scanning... - AIO Scanner</title>
  <meta name="description" content="Real-time AI scan van je website in progress." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gradient-to-br from-bg-light via-white to-blue-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    
    {#if error}
      <!-- Error State -->
      <div class="text-center">
        <div class="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div class="text-red-600 text-lg mb-4">⚠️ Fout</div>
          <p class="text-red-800 mb-4">{error}</p>
          <Button on:click={() => goto('/')} variant="outline">
            Probeer Opnieuw
          </Button>
        </div>
      </div>
    {:else}
      <!-- Scan Header -->
      <div class="text-center mb-12">
        <h1 class="text-3xl font-header font-bold text-gray-900 mb-4">
          {#if scanStatus === 'completed'}
            🎉 Scan Voltooid!
          {:else if scanStatus === 'running'}
            🔍 AI Scan in Progress
          {:else}
            ⏳ Scan wordt voorbereid...
          {/if}
        </h1>
        <p class="text-lg text-gray-600">
          {#if scanStatus === 'completed'}
            Je website analyse is klaar
          {:else}
            We analyseren je website voor AI-vindbaarheid...
          {/if}
        </p>
      </div>

      <!-- Main Content Grid -->
      <div class="grid lg:grid-cols-2 gap-8">
        <!-- Left Column: Progress & Status -->
        <div class="space-y-8">
          <!-- Progress Circle -->
          <div class="glass p-8 rounded-2xl text-center">
            <ProgressCircle 
              progress={scanProgress} 
              size={192}
              strokeWidth={8}
            />
            <div class="mt-4">
              {#if scanStatus === 'completed'}
                <p class="text-lg font-semibold text-green-600">
                  Score: {overallScore}/100
                </p>
              {:else}
                <p class="text-gray-600">
                  Geschatte tijd: ~{estimatedTime} seconden
                </p>
              {/if}
            </div>
          </div>

          <!-- Module Progress -->
          <ModuleProgressGrid {modules} />
        </div>

        <!-- Right Column: Activity & Preview -->
        <div class="space-y-8">
          <!-- Activity Log -->
          <ActivityLog items={activityItems} />

          <!-- Website Preview -->
          <div class="glass p-8 rounded-2xl">
            <h3 class="text-sm font-medium text-gray-600 mb-6">Website Preview</h3>
            <div class="h-[400px]">
              <WebsitePreview websiteUrl={urlToScan} />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-4">
            {#if scanStatus !== 'completed'}
              <Button variant="outline" class="w-full sm:w-auto" on:click={cancelScan}>
                Scan Annuleren
              </Button>
            {/if}
            
            {#if scanStatus === 'completed'}
              <Button variant="default" class="w-full sm:w-auto" disabled>
                🎉 Verwerking voltooid
              </Button>
            {/if}
          </div>
        </div>
      </div>
    {/if}
  </div>
</main>

<!-- Email Capture Modal -->
{#if showEmailModal}
  <EmailCaptureModal
    {scanId}
    url={urlToScan}
    isOpen={showEmailModal}
    onSuccess={() => {
      showEmailModal = false;
      goto(`/scan/${scanId}/results`);
    }}
    onClose={handleEmailModalClose}
  />
{/if} 