<!-- src/routes/scan/[scanId]/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Header from '$lib/components/layout/Header.svelte';
  import ProgressCircle from '$lib/components/features/scan/ProgressCircle.svelte';
  import StatusIndicators from '$lib/components/features/scan/StatusIndicators.svelte';

  // Get data directly from the $page store. This is more robust on the client.
  const scanId = $page.params.scanId;
  const urlToScan = $page.url.searchParams.get('url');

  let progress = 0;
  let statusText = 'Scan wordt gestart...';
  let scanError: string | null = null;

  onMount(() => {
    if (!scanId || !urlToScan) {
      scanError = 'Scan informatie niet gevonden in URL.';
      return;
    }

    const pollScanStatus = async () => {
      try {
        const response = await fetch(`/api/scan/results/${scanId}`);
        
        if (response.status === 404) {
          setTimeout(pollScanStatus, 2000);
          return;
        }
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const resultData = await response.json();
        
        statusText = `Scan status: ${resultData.overview.status}`;
        progress = resultData.overview.status === 'running' ? (progress + 10) % 100 : progress;

        if (resultData.overview.status === 'completed' || resultData.overview.status === 'failed') {
          goto(`/scan/${scanId}/results`);
        } else {
          setTimeout(pollScanStatus, 2000);
        }

      } catch (error) {
        console.error('Polling error:', error);
        scanError = 'Er is een fout opgetreden bij het ophalen van de scanstatus.';
      }
    };

    setTimeout(pollScanStatus, 1000);
  });
</script>

<svelte:head>
  <title>Scan wordt uitgevoerd - AIO Scanner</title>
  <meta name="description" content="Je AI-gereedheid scan wordt momenteel uitgevoerd." />
</svelte:head>

<Header />

{#if urlToScan && scanId}
  <main class="min-h-screen bg-gradient-to-br from-bg-light via-white to-blue-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-header font-bold text-gray-900 mb-4">
          Een moment geduld...
        </h1>
        <p class="text-lg text-gray-600 mb-6">
          Je scan voor {urlToScan} wordt nu uitgevoerd.
        </p>
      </div>
      <div class="grid lg:grid-cols-2 gap-8 mb-12">
        <div class="space-y-8">
          <div class="glass p-8 rounded-2xl flex flex-col items-center justify-center">
            <h2 class="text-xl font-semibold mb-4 text-center">Scan wordt uitgevoerd...</h2>
            <ProgressCircle {progress} size={160} />
            <p class="mt-4 text-gray-600 text-center">{statusText}</p>
            <div class="mt-6 w-full text-center">
              <p class="text-sm text-gray-500">URL: {urlToScan}</p>
              <p class="text-sm text-gray-500">Scan ID: {scanId}</p>
            </div>
            {#if scanError}
              <div class="mt-4 text-red-500 bg-red-100 p-3 rounded-lg">{scanError}</div>
            {/if}
          </div>
        </div>
        <div class="glass p-8 rounded-2xl">
          <StatusIndicators />
        </div>
      </div>
    </div>
  </main>
{:else}
  <main class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-4">Scan informatie ontbreekt</h1>
      <p class="mb-4">De URL of Scan ID is niet gevonden. Ga terug en probeer het opnieuw.</p>
      <a href="/" class="text-blue-600 hover:underline">Ga naar de homepage</a>
    </div>
  </main>
{/if} 