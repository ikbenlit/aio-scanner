<!-- src/routes/crawl/start/+page.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import URLInput from '$lib/components/core/URLInput.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  
  let isStartingCrawl = false;
  let errorMessage = '';
  
  // Crawl configuration options
  let crawlOptions = {
    maxPages: 250,
    maxDepth: 5,
    respectRobotsTxt: true,
    includeSubdomains: false
  };
  
  // Payment verification - assume Business tier required for crawling
  const paymentId = 'dev_business_scan_test'; // Development payment ID
  const userEmail = 'business@example.com'; // TODO: Get from auth context
  
  // Handle crawl start
  async function handleStartCrawl(event: CustomEvent<{ url: string }>) {
    const { url } = event.detail;
    
    if (isStartingCrawl) return;
    
    try {
      isStartingCrawl = true;
      errorMessage = '';
      console.log(`🕷️ Starting site-wide crawl for: ${url}`);
      
      // Start crawl via API
      const response = await fetch('/api/scan/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          email: userEmail,
          paymentId: paymentId,
          options: crawlOptions
        })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Er ging iets mis bij het starten van de crawl');
      }
      
      console.log('✅ Crawl started successfully:', result);
      
      // Redirect to progress monitoring page
      await goto(`/crawl/${result.crawlId}/progress`);
      
    } catch (error) {
      console.error('❌ Crawl start failed:', error);
      errorMessage = error instanceof Error ? error.message : 'Onbekende fout opgetreden';
    } finally {
      isStartingCrawl = false;
    }
  }
</script>

<svelte:head>
  <title>Site-wide Analyse Starten - AIO Scanner</title>
  <meta name="description" content="Start een volledige analyse van uw website met de AIO Scanner Business tier." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gradient-to-br from-blue-50 to-white">
  <div class="container mx-auto px-4 py-16">
    
    <!-- Hero Section -->
    <div class="max-w-4xl mx-auto text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
        Analyseer uw <span class="text-blue-600">volledige website</span>
      </h1>
      <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Ontdek SEO-kansen en technische problemen op alle pagina's van uw website. 
        Onze AI-gestuurde crawler analyseert tot 250 pagina's voor complete inzichten.
      </p>
      
      <!-- Business Tier Badge -->
      <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        Business Tier - Site-wide Analyse
      </div>
    </div>

    <!-- Crawl Start Form -->
    <div class="max-w-2xl mx-auto">
      <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">
          Website URL invoeren
        </h2>
        
        <!-- URL Input Component -->
        <URLInput 
          on:scan={handleStartCrawl}
          isLoading={isStartingCrawl}
          buttonText={isStartingCrawl ? 'Crawl wordt gestart...' : 'Start Site-wide Analyse'}
          placeholder="https://uw-website.nl"
          disabled={isStartingCrawl}
        />
        
        <!-- Error Display -->
        {#if errorMessage}
          <div class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-red-400 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
              </svg>
              <div>
                <h3 class="text-sm font-medium text-red-800">Fout bij starten crawl</h3>
                <p class="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Crawl Configuration -->
      <div class="bg-gray-50 rounded-xl p-6 mb-8">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Crawl Instellingen</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div class="flex justify-between py-2">
            <span class="text-gray-600">Maximum pagina's:</span>
            <span class="font-medium">{crawlOptions.maxPages}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600">Crawl diepte:</span>
            <span class="font-medium">{crawlOptions.maxDepth} niveau's</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600">Robots.txt:</span>
            <span class="font-medium">{crawlOptions.respectRobotsTxt ? 'Respecteren' : 'Negeren'}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-600">Subdomeinen:</span>
            <span class="font-medium">{crawlOptions.includeSubdomains ? 'Inclusief' : 'Alleen hoofddomein'}</span>
          </div>
        </div>
      </div>

      <!-- Expected Process Info -->
      <div class="bg-blue-50 rounded-xl p-6">
        <h3 class="text-lg font-semibold text-blue-900 mb-4">Wat kunt u verwachten?</h3>
        <div class="space-y-3 text-sm text-blue-800">
          <div class="flex items-start">
            <svg class="w-5 h-5 mr-3 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Onze AI-crawler ontdekt automatisch alle pagina's van uw website</span>
          </div>
          <div class="flex items-start">
            <svg class="w-5 h-5 mr-3 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Elke pagina wordt geanalyseerd op SEO en technische aspecten</span>
          </div>
          <div class="flex items-start">
            <svg class="w-5 h-5 mr-3 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>U krijgt een comprehensive dashboard met site-wide inzichten</span>
          </div>
          <div class="flex items-start">
            <svg class="w-5 h-5 mr-3 mt-0.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span>Analyse duurt typisch 5-15 minuten afhankelijk van website grootte</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>

<Footer />

<style>
  /* Component-specific styles if needed */
</style>