<!-- src/routes/crawl/[crawlId]/progress/+page.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  
  // Page parameters
  $: crawlId = $page.params.crawlId;
  
  // Crawl status state
  let crawlStatus: any = null;
  let isLoading = true;
  let error = '';
  let pollInterval: NodeJS.Timeout | null = null;
  
  // Progress calculation
  $: progress = crawlStatus ? 
    Math.round((crawlStatus.pagesScanned / Math.max(crawlStatus.totalPagesFound, 1)) * 100) : 0;
  
  // Estimated time remaining (very rough calculation)
  $: estimatedTimeRemaining = crawlStatus && crawlStatus.pagesScanned > 0 ? 
    Math.max(0, Math.round((crawlStatus.totalPagesFound - crawlStatus.pagesScanned) * 3)) : null;
  
  // Fetch crawl status
  async function fetchCrawlStatus() {
    try {
      const response = await fetch(`/api/scan/crawl/${crawlId}`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch crawl status');
      }
      
      crawlStatus = result;
      isLoading = false;
      error = '';
      
      // If crawl is completed, redirect to results
      if (crawlStatus.status === 'completed') {
        await goto(`/crawl/${crawlId}/results`);
      }
      
      console.log('📊 Crawl status updated:', crawlStatus);
      
    } catch (err) {
      console.error('❌ Failed to fetch crawl status:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
      isLoading = false;
    }
  }
  
  // Start polling on mount
  onMount(() => {
    fetchCrawlStatus();
    
    // Poll every 3 seconds
    pollInterval = setInterval(fetchCrawlStatus, 3000);
  });
  
  // Cleanup on destroy
  onDestroy(() => {
    if (pollInterval) {
      clearInterval(pollInterval);
    }
  });
  
  // Handle manual refresh
  function handleRefresh() {
    isLoading = true;
    fetchCrawlStatus();
  }
  
  // Get status message
  function getStatusMessage(status: string) {
    switch (status) {
      case 'pending':
        return 'Crawl wordt voorbereid...';
      case 'running':
        return 'Uw website wordt geanalyseerd...';
      case 'completed':
        return 'Analyse voltooid!';
      case 'failed':
        return 'Analyse is gestopt door een fout';
      default:
        return 'Status onbekend';
    }
  }
  
  // Get status color
  function getStatusColor(status: string) {
    switch (status) {
      case 'pending':
        return 'text-yellow-600';
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
</script>

<svelte:head>
  <title>Site-wide Analyse in Progress - AIO Scanner</title>
  <meta name="description" content="Uw website wordt geanalyseerd. Volg de voortgang live." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-white">
  <div class="container mx-auto px-4 py-16">
    
    <!-- Loading State -->
    {#if isLoading && !crawlStatus}
      <div class="max-w-2xl mx-auto text-center">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">Crawl status wordt opgehaald...</h1>
          <p class="text-gray-600">Een moment geduld.</p>
        </div>
      </div>
    
    <!-- Error State -->
    {:else if error}
      <div class="max-w-2xl mx-auto text-center">
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">Er ging iets mis</h1>
          <p class="text-gray-600 mb-6">{error}</p>
          <Button on:click={handleRefresh}>
            Opnieuw proberen
          </Button>
        </div>
      </div>
    
    <!-- Progress Display -->
    {:else if crawlStatus}
      <div class="max-w-4xl mx-auto">
        
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Site-wide Analyse
          </h1>
          <p class="text-lg text-gray-600">
            <span class="font-medium">{crawlStatus.rootUrl}</span>
          </p>
        </div>

        <!-- Status Card -->
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          
          <!-- Status Header -->
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center">
              <div class="w-3 h-3 rounded-full mr-3 {crawlStatus.status === 'running' ? 'bg-blue-500 animate-pulse' : crawlStatus.status === 'completed' ? 'bg-green-500' : crawlStatus.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'}"></div>
              <h2 class="text-xl font-semibold {getStatusColor(crawlStatus.status)}">
                {getStatusMessage(crawlStatus.status)}
              </h2>
            </div>
            <Button variant="outline" size="sm" on:click={handleRefresh}>
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"/>
              </svg>
              Vernieuwen
            </Button>
          </div>

          <!-- Progress Bar -->
          {#if crawlStatus.status === 'running' || crawlStatus.status === 'completed'}
            <div class="mb-6">
              <div class="flex justify-between text-sm text-gray-600 mb-2">
                <span>Voortgang</span>
                <span>{crawlStatus.pagesScanned} van {crawlStatus.totalPagesFound} pagina's</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-3">
                <div 
                  class="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                  style="width: {progress}%"
                ></div>
              </div>
              <div class="text-center mt-2">
                <span class="text-2xl font-bold text-blue-600">{progress}%</span>
              </div>
            </div>
          {/if}

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{crawlStatus.pagesScanned}</div>
              <div class="text-sm text-gray-600">Pagina's Gescand</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{crawlStatus.totalPagesFound}</div>
              <div class="text-sm text-gray-600">Pagina's Gevonden</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">{crawlId.slice(0, 8)}...</div>
              <div class="text-sm text-gray-600">Crawl ID</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-gray-900">
                {#if estimatedTimeRemaining !== null}
                  {estimatedTimeRemaining}s
                {:else}
                  -
                {/if}
              </div>
              <div class="text-sm text-gray-600">Geschat Resterend</div>
            </div>
          </div>

          <!-- Time Info -->
          <div class="text-sm text-gray-500 text-center">
            Gestart: {new Date(crawlStatus.createdAt).toLocaleString('nl-NL')}
          </div>
        </div>

        <!-- What's Happening Section -->
        {#if crawlStatus.status === 'running'}
          <div class="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 class="text-lg font-semibold text-blue-900 mb-4">Wat gebeurt er nu?</h3>
            <div class="space-y-3 text-sm text-blue-800">
              <div class="flex items-start">
                <div class="w-5 h-5 mr-3 mt-0.5">
                  <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <span>Onze AI-crawler ontdekt en analyseert elke pagina van uw website</span>
              </div>
              <div class="flex items-start">
                <div class="w-5 h-5 mr-3 mt-0.5">
                  <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <span>Technische SEO aspecten worden gecontroleerd per pagina</span>
              </div>
              <div class="flex items-start">
                <div class="w-5 h-5 mr-3 mt-0.5">
                  <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <span>AI-content analyse wordt uitgevoerd voor kwaliteitsdetectie</span>
              </div>
              <div class="flex items-start">
                <div class="w-5 h-5 mr-3 mt-0.5">
                  <div class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
                <span>Site-wide statistieken en patronen worden berekend</span>
              </div>
            </div>
          </div>
        {/if}

        <!-- Failed State Info -->
        {#if crawlStatus.status === 'failed'}
          <div class="bg-red-50 rounded-xl p-6">
            <h3 class="text-lg font-semibold text-red-900 mb-4">De scan is onverwacht gestopt</h3>
            <p class="text-red-800 mb-4">
              Er is een fout opgetreden tijdens het crawlen van uw website. Dit kan verschillende oorzaken hebben:
            </p>
            <ul class="text-sm text-red-700 space-y-2 list-disc list-inside mb-6">
              <li>Website tijdelijk niet bereikbaar</li>
              <li>Robot.txt beperkt crawling toegang</li>
              <li>Technische server problemen</li>
              <li>Te complexe website structuur</li>
            </ul>
            <div class="flex gap-4">
              <Button on:click={() => goto('/crawl/start')}>
                Opnieuw Proberen
              </Button>
              <Button variant="outline" on:click={() => goto('/')}>
                Terug naar Home
              </Button>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</main>

<Footer />

<style>
  /* Component-specific styles for animations */
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
</style>