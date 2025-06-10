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
  import EmailCaptureModal from '$lib/components/features/scan/EmailCaptureModal.svelte';
  import { Button } from '$lib/components/ui/button';
  import { supabase } from '$lib/supabaseClient.js';
  import type { FlowAction } from '$lib/scan/completion';
  import type { ScanResult } from '$lib/scan/types';

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
    { id: 'ai_content', name: 'AI Content Analysis', icon: '🤖', status: 'pending', score: 0 },
    { id: 'ai_citation', name: 'AI Citation Opportunities', icon: '🏆', status: 'pending', score: 0 }
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

  async function simulateTestScanCompletion() {
    console.log('🧪 Simulating test scan completion...');
    
    // Simulate scan progress
    scanStatus = 'running';
    scanProgress = 20;
    estimatedTime = 15;
    
    // Update activity log
    activityItems = [
      { text: 'Content wordt geanalyseerd...', status: 'success' },
      { text: 'Technical SEO check gestart', status: 'success' },
      { text: 'Schema markup detectie...', status: 'pending' }
    ];
    
    // Simulate progress updates
    setTimeout(() => {
      scanProgress = 60;
      estimatedTime = 8;
      activityItems = [
        { text: 'Technical SEO analyse voltooid', status: 'success' },
        { text: 'Schema markup gedetecteerd', status: 'success' },
        { text: 'AI analyse wordt uitgevoerd...', status: 'pending' }
      ];
      
      // Update module progress
      modules = modules.map((module, index) => ({
        ...module,
        status: index < 2 ? 'complete' : 'scanning',
        score: index < 2 ? Math.round(65 + Math.random() * 30) : 0
      }));
    }, 2000);
    
    // Complete scan
    setTimeout(() => {
      scanStatus = 'completed';
      scanProgress = 100;
      estimatedTime = 0;
      overallScore = 73;
      
      activityItems = [
        { text: 'Technical SEO analyse voltooid', status: 'success' },
        { text: 'Schema markup gedetecteerd', status: 'success' },
        { text: 'AI analyse afgerond', status: 'success' },
        { text: 'Test rapport gegenereerd', status: 'success' }
      ];
      
      // Complete all modules
      modules = modules.map((module, index) => ({
        ...module,
        status: 'complete',
        score: Math.round(65 + Math.random() * 30)
      }));
      
      // Stop polling and show email modal for test
      clearInterval(pollInterval);
      setTimeout(() => {
        showEmailModal = true;
      }, 1000);
      
    }, 5000);
  }

  async function pollScanStatus() {
    try {
      // Check if this is a test scan (from test-simple endpoint)
      const scanIdNum = parseInt(scanId);
      const isTestScan = scanIdNum > 1000 && scanIdNum < 10000; // Test IDs are 4-digit numbers
      
      if (isTestScan) {
        // Simulate test scan completion
        await simulateTestScanCompletion();
        return;
      }

      const { data, error: dbError } = await supabase
        .from('scans')
        .select('*')
        .eq('id', scanId)
        .single();

      if (dbError || !data) {
        console.error('Error fetching scan:', dbError);
        return;
      }

      // Update status
      scanStatus = data.status;
      overallScore = data.overall_score || 0;

      // Update progress based on status
      if (scanStatus === 'pending') {
        scanProgress = 0;
        estimatedTime = 30;
      } else if (scanStatus === 'running') {
        scanProgress = Math.min(90, scanProgress + 5); // Gradual progress
        estimatedTime = Math.max(5, estimatedTime - 2);
        
        // Update activity log
        if (activityItems.length === 1) {
          activityItems = [
            { text: 'Content wordt geanalyseerd...', status: 'pending' },
            { text: 'Technical SEO check gestart', status: 'success' },
            { text: 'Schema markup detectie...', status: 'pending' }
          ];
        }
      } else if (scanStatus === 'completed') {
        scanProgress = 100;
        estimatedTime = 0;
        
        // Update final activity
        activityItems = [
          { text: 'Technical SEO analyse voltooid', status: 'success' },
          { text: 'Schema markup gedetecteerd', status: 'success' },
          { text: 'AI analyse afgerond', status: 'success' },
          { text: 'Rapport gegenereerd', status: 'success' }
        ];

        // Stop polling and trigger completion flow
        clearInterval(pollInterval);
        await handleScanCompletion();
      } else if (scanStatus === 'failed') {
        error = 'Scan mislukt. Probeer het opnieuw.';
        clearInterval(pollInterval);
      }

      // Update module progress (mock data based on overall progress)
      if (scanStatus === 'running' || scanStatus === 'completed') {
        modules = modules.map((module, index) => ({
          ...module,
          status: index < (scanProgress / 25) ? 'complete' : scanProgress > index * 25 ? 'scanning' : 'pending',
          score: scanProgress > index * 25 ? Math.round(65 + Math.random() * 30) : 0
        }));
      }

    } catch (err) {
      console.error('Polling error:', err);
    }
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

  async function handleEmailSubmit(event: CustomEvent<{ email: string }>) {
    try {
      const { email } = event.detail;
      console.log('Processing email capture:', email);

      const response = await fetch('/api/scan/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scanId })
      });

      if (!response.ok) {
        throw new Error('Email capture failed');
      }

      const data = await response.json();
      
      // Close modal and redirect to results
      showEmailModal = false;
      goto(data.redirectUrl);

    } catch (err) {
      console.error('Email capture error:', err);
      error = 'Er is een fout opgetreden bij het verwerken van je email';
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
{#if showEmailModal && scanResults}
  <EmailCaptureModal 
    {scanResults}
    isOpen={showEmailModal}
    on:submit={handleEmailSubmit}
    on:close={handleEmailModalClose}
  />
{/if} 