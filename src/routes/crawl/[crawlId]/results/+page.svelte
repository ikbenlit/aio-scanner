<!-- src/routes/crawl/[crawlId]/results/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  
  // Page parameters
  $: crawlId = $page.params.crawlId;
  
  // Data state
  let crawlResults: any = null;
  let isLoading = true;
  let error = '';
  let currentPage = 1;
  let pageSize = 20;
  
  // Filters
  let statusFilter = 'all'; // all, completed, failed
  let searchQuery = '';
  
  // Site-wide statistics
  $: siteStats = crawlResults?.crawlStatus ? {
    totalPages: crawlResults.crawlStatus.totalPagesFound,
    scannedPages: crawlResults.crawlStatus.pagesScanned,
    avgScore: calculateAverageScore(crawlResults.results?.pages || []),
    issuesFound: calculateTotalIssues(crawlResults.results?.pages || []),
    topIssues: getTopIssueTypes(crawlResults.results?.pages || [])
  } : null;
  
  // Filtered pages
  $: filteredPages = crawlResults?.results?.pages ? 
    filterPages(crawlResults.results.pages, statusFilter, searchQuery) : [];
  
  // Pagination
  $: totalPages = Math.ceil(filteredPages.length / pageSize);
  $: paginatedPages = filteredPages.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  
  // Fetch crawl results
  async function fetchCrawlResults() {
    try {
      isLoading = true;
      error = '';
      
      const response = await fetch(`/api/scan/results/crawl/${crawlId}?page=1&limit=1000`);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch crawl results');
      }
      
      crawlResults = result;
      console.log('📊 Crawl results loaded:', crawlResults);
      
    } catch (err) {
      console.error('❌ Failed to fetch crawl results:', err);
      error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
      isLoading = false;
    }
  }
  
  // Helper functions
  function calculateAverageScore(pages: any[]) {
    if (!pages.length) return 0;
    const scores = pages
      .map(p => p.scans?.overallScore)
      .filter(score => typeof score === 'number');
    return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  }
  
  function calculateTotalIssues(pages: any[]) {
    return pages.reduce((total, page) => {
      const findings = page.scans?.moduleResults?.flatMap(m => m.findings || []) || [];
      return total + findings.filter(f => f.status === 'warning' || f.status === 'error').length;
    }, 0);
  }
  
  function getTopIssueTypes(pages: any[]) {
    const issueTypes: { [key: string]: number } = {};
    
    pages.forEach(page => {
      const findings = page.scans?.moduleResults?.flatMap(m => m.findings || []) || [];
      findings.forEach(finding => {
        if (finding.status === 'warning' || finding.status === 'error') {
          issueTypes[finding.category] = (issueTypes[finding.category] || 0) + 1;
        }
      });
    });
    
    return Object.entries(issueTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }
  
  function filterPages(pages: any[], statusFilter: string, searchQuery: string) {
    let filtered = pages;
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(page => page.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(page => 
        page.url.toLowerCase().includes(query) ||
        (page.scans?.pageTitle || '').toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }
  
  function getPageStatusColor(status: string) {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  }
  
  function getScoreColor(score: number) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  }
  
  // Start single page scan
  async function startSinglePageScan(url: string) {
    try {
      // Redirect to existing single page scan flow
      const encodedUrl = encodeURIComponent(url);
      await goto(`/?url=${encodedUrl}`);
    } catch (err) {
      console.error('Failed to start single page scan:', err);
    }
  }
  
  onMount(() => {
    fetchCrawlResults();
  });
</script>

<svelte:head>
  <title>Site-wide Scan Resultaten - AIO Scanner</title>
  <meta name="description" content="Comprehensive resultaten van uw site-wide SEO analyse." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gray-50">
  
  <!-- Loading State -->
  {#if isLoading}
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 class="text-2xl font-semibold text-gray-900 mb-2">Resultaten worden geladen...</h1>
        <p class="text-gray-600">Even geduld, we halen uw site-wide analyse op.</p>
      </div>
    </div>
  
  <!-- Error State -->
  {:else if error}
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto">
        <Alert>
          <AlertDescription>
            <strong>Fout bij ophalen resultaten:</strong> {error}
          </AlertDescription>
        </Alert>
        <div class="text-center mt-6">
          <Button on:click={fetchCrawlResults}>Opnieuw proberen</Button>
        </div>
      </div>
    </div>
  
  <!-- Results Display -->
  {:else if crawlResults && siteStats}
    
    <!-- Header Section -->
    <div class="bg-white border-b">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
          <div class="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">Site-wide Scan Resultaten</h1>
              <p class="text-lg text-gray-600">{crawlResults.crawlStatus.rootUrl}</p>
              <p class="text-sm text-gray-500">
                Voltooid: {new Date(crawlResults.crawlStatus.createdAt).toLocaleString('nl-NL')}
              </p>
            </div>
            <div class="flex gap-3">
              <Button variant="outline" on:click={() => goto(`/crawl/${crawlId}/progress`)}>
                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" clip-rule="evenodd"/>
                </svg>
                Crawl Details
              </Button>
              <Button on:click={() => goto('/crawl/start')}>
                Nieuwe Site Scan
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistics Overview -->
    <div class="bg-white">
      <div class="container mx-auto px-4 py-8">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-xl font-semibold text-gray-900 mb-6">Site-wide Overzicht</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-blue-50 rounded-xl p-6">
              <div class="text-3xl font-bold text-blue-600 mb-2">{siteStats.scannedPages}</div>
              <div class="text-sm text-blue-800">Pagina's Geanalyseerd</div>
              <div class="text-xs text-blue-600 mt-1">van {siteStats.totalPages} gevonden</div>
            </div>
            
            <div class="bg-green-50 rounded-xl p-6">
              <div class="text-3xl font-bold {getScoreColor(siteStats.avgScore)} mb-2">{siteStats.avgScore}</div>
              <div class="text-sm text-green-800">Gemiddelde Score</div>
              <div class="text-xs text-green-600 mt-1">over alle pagina's</div>
            </div>
            
            <div class="bg-yellow-50 rounded-xl p-6">
              <div class="text-3xl font-bold text-yellow-600 mb-2">{siteStats.issuesFound}</div>
              <div class="text-sm text-yellow-800">Issues Gevonden</div>
              <div class="text-xs text-yellow-600 mt-1">site-wide</div>
            </div>
            
            <div class="bg-purple-50 rounded-xl p-6">
              <div class="text-3xl font-bold text-purple-600 mb-2">{siteStats.topIssues.length}</div>
              <div class="text-sm text-purple-800">Issue Categorieën</div>
              <div class="text-xs text-purple-600 mt-1">geïdentificeerd</div>
            </div>
          </div>

          <!-- Top Issues -->
          {#if siteStats.topIssues.length > 0}
            <div class="bg-red-50 rounded-xl p-6 mb-8">
              <h3 class="text-lg font-semibold text-red-900 mb-4">Meest Voorkomende Issues</h3>
              <div class="space-y-3">
                {#each siteStats.topIssues as issue}
                  <div class="flex justify-between items-center">
                    <span class="text-red-800 font-medium">{issue.type}</span>
                    <span class="bg-red-200 text-red-800 px-2 py-1 rounded-full text-sm">
                      {issue.count} pagina's
                    </span>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="container mx-auto px-4 py-6">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div class="flex flex-wrap gap-4 items-center justify-between">
            <div class="flex flex-wrap gap-4 items-center">
              <!-- Status Filter -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select bind:value={statusFilter} class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                  <option value="all">Alle statussen</option>
                  <option value="completed">Voltooid</option>
                  <option value="failed">Gefaald</option>
                  <option value="pending">Wachtend</option>
                </select>
              </div>
              
              <!-- Search -->
              <div class="flex-1 min-w-64">
                <label class="block text-sm font-medium text-gray-700 mb-1">Zoeken</label>
                <input 
                  type="text" 
                  bind:value={searchQuery}
                  placeholder="Zoek op URL of pagina titel..."
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            
            <div class="text-sm text-gray-600">
              {filteredPages.length} van {crawlResults.results.pages.length} pagina's
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Table -->
    <div class="container mx-auto px-4 pb-16">
      <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm overflow-hidden">
          
          <!-- Table Header -->
          <div class="bg-gray-50 px-6 py-4 border-b">
            <h3 class="text-lg font-semibold text-gray-900">Pagina Resultaten</h3>
          </div>
          
          <!-- Table Content -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="text-left py-3 px-6 font-medium text-gray-700">URL</th>
                  <th class="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                  <th class="text-left py-3 px-6 font-medium text-gray-700">Score</th>
                  <th class="text-left py-3 px-6 font-medium text-gray-700">Issues</th>
                  <th class="text-left py-3 px-6 font-medium text-gray-700">Acties</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                {#each paginatedPages as pageResult}
                  <tr class="hover:bg-gray-50">
                    <td class="py-4 px-6">
                      <div>
                        <div class="font-medium text-gray-900 truncate max-w-md" title={pageResult.url}>
                          {pageResult.url.replace(/^https?:\/\//, '')}
                        </div>
                        {#if pageResult.scans?.pageTitle}
                          <div class="text-sm text-gray-500 truncate max-w-md" title={pageResult.scans.pageTitle}>
                            {pageResult.scans.pageTitle}
                          </div>
                        {/if}
                      </div>
                    </td>
                    <td class="py-4 px-6">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getPageStatusColor(pageResult.status)}">
                        {pageResult.status}
                      </span>
                    </td>
                    <td class="py-4 px-6">
                      {#if pageResult.scans?.overallScore !== undefined}
                        <span class="font-semibold {getScoreColor(pageResult.scans.overallScore)}">
                          {pageResult.scans.overallScore}
                        </span>
                      {:else}
                        <span class="text-gray-400">-</span>
                      {/if}
                    </td>
                    <td class="py-4 px-6">
                      {#if pageResult.scans?.moduleResults}
                        {@const findings = pageResult.scans.moduleResults.flatMap(m => m.findings || [])}
                        {@const issues = findings.filter(f => f.status === 'warning' || f.status === 'error')}
                        <span class="text-sm text-gray-600">{issues.length}</span>
                      {:else}
                        <span class="text-gray-400">-</span>
                      {/if}
                    </td>
                    <td class="py-4 px-6">
                      <div class="flex gap-2">
                        {#if pageResult.status === 'completed' && pageResult.scan_result_id}
                          <Button size="sm" variant="outline" on:click={() => goto(`/scan/${pageResult.scan_result_id}/results`)}>
                            Details
                          </Button>
                        {/if}
                        <Button size="sm" on:click={() => startSinglePageScan(pageResult.url)}>
                          Re-scan
                        </Button>
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          {#if totalPages > 1}
            <div class="bg-gray-50 px-6 py-4 border-t flex items-center justify-between">
              <div class="text-sm text-gray-600">
                Pagina {currentPage} van {totalPages}
              </div>
              <div class="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  disabled={currentPage <= 1}
                  on:click={() => currentPage = Math.max(1, currentPage - 1)}
                >
                  Vorige
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={currentPage >= totalPages}
                  on:click={() => currentPage = Math.min(totalPages, currentPage + 1)}
                >
                  Volgende
                </Button>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</main>

<Footer />

<style>
  /* Table responsive styles */
  @media (max-width: 768px) {
    table {
      font-size: 0.875rem;
    }
    
    .max-w-md {
      max-width: 200px;
    }
  }
</style>