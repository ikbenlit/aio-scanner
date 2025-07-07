<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/layout/Header.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import ProgressCircle from '$lib/components/features/scan/ProgressCircle.svelte';
  import ModuleProgressGrid from '$lib/components/features/scan/ModuleProgressGrid.svelte';
  import WebsitePreview from '$lib/components/features/scan/WebsitePreview.svelte';
  import type { ScanModule } from '$lib/types/scan';
  import type { ModuleItem } from '$lib/components/features/scan/ModuleProgressGrid.svelte';
  
  interface PageData {
    scan: {
      id: string;
      url: string;
      status: string;
      overallScore: number;
      moduleResults: ScanModule[];
      createdAt: string;
      completedAt: string | null;
      screenshot?: string; // Screenshot data
      tier: string;
      pdfGenerationStatus: string | null;
      pdfUrl: string | null;
    };
    emailStatus: {
      email: string | null;
      sentAt: string | null;
    };
    screenshot: string | null;
    error: string | null;
  }
  
  export let data: PageData;
  const { scan, emailStatus, screenshot, error } = data;
  
  console.log('Scan module results:', scan.moduleResults);
  console.log('PDF Debug Info:', {
    tier: scan.tier,
    email: emailStatus.email,
    pdfStatus: scan.pdfGenerationStatus,
    pdfUrl: scan.pdfUrl,
    showButton: scan.tier !== 'basic' && emailStatus.email && scan.pdfGenerationStatus === 'completed' && scan.pdfUrl
  });
  
  let emailSentTime: string | null = null;
  if (emailStatus.sentAt) {
    try {
      emailSentTime = new Date(emailStatus.sentAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    } catch(e) {
      // ignore invalid date
    }
  }

  // Poll for scan results if scan is not complete
  onMount(() => {
    if (scan.status !== 'completed' && scan.status !== 'failed' && typeof window !== 'undefined') {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/scan/results/${scan.id}`);
          if (res.ok) {
            const resultData = await res.json();
            if (resultData.scan.status === 'completed' || resultData.scan.status === 'failed') {
              clearInterval(interval);
              // Force a full reload to get server-loaded data
              window.location.reload();
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(interval);
    }
  });

  function handleNewScan() {
    goto('/');
  }

  function handleUpgrade() {
    goto('/upgrade');
  }

  // PDF Download functie
  async function downloadPDF(scanId: string, email: string | null) {
    if (!email) {
      alert('Email not found for this scan. Please try running the scan again and provide an email to download the report.');
      return;
    }

    try {
      const response = await fetch(`/api/pdf/${scanId}/download?email=${encodeURIComponent(email)}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AIO-Scanner-${scan.tier}-Report-${new URL(scan.url).hostname}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorText = await response.text();
        alert(`PDF download mislukt: ${errorText}`);
      }
    } catch (err) {
      console.error('PDF download error:', err);
      alert('Er is een onverwachte fout opgetreden bij het downloaden van de PDF.');
    }
  }

  // Convert modules to progress grid format - AI modules eerst, dan de rest
  const moduleItems: ModuleItem[] = [
    // AI Modules bovenaan
    {
      id: 'ai_citation',
      name: 'AI Citation',
      icon: '🏆',
      status: 'complete' as const
    },
    {
      id: 'ai_content',
      name: 'AI Content',
      icon: '🤖',
      status: 'complete' as const
    },
    // Technische modules
    {
      id: 'technical_seo',
      name: 'Technical SEO',
      icon: '⚙️',
      status: 'complete' as const
    },
    {
      id: 'schema_markup',
      name: 'Schema Markup',
      icon: '📝',
      status: 'complete' as const
    },
    // Modules in ontwikkeling
    {
      id: 'cross_web',
      name: 'Cross-web Presence',
      icon: '🌐',
      status: 'pending' as const
    },
    {
      id: 'freshness',
      name: 'Content Freshness',
      icon: '🔄',
      status: 'pending' as const
    },
    {
      id: 'multimodal',
      name: 'Multimodal Optimization',
      icon: '🎨',
      status: 'pending' as const
    },
    {
      id: 'monitoring',
      name: 'Monitoring Hooks',
      icon: '📊',
      status: 'pending' as const
    }
  ];

  // State voor inklapbare secties
  let expandedStates: Record<string, boolean> = {};
  
  // Initialiseer expanded states - alle modules uitgeklapt
  moduleItems.forEach(module => {
    expandedStates[module.id] = true;
  });

  function toggleModule(moduleId: string) {
    expandedStates[moduleId] = !expandedStates[moduleId];
  }

  // Module name normalization function
  function normalizeModuleName(name: string): string {
    // Convert camelCase to space-separated words
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^\s+/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Find matching module data for each moduleItem
  function getModuleData(moduleItem: ModuleItem): ScanModule | undefined {
    return scan.moduleResults.find(result => {
      const normalizedResultName = normalizeModuleName(result.moduleName || result.name || '');
      const normalizedItemName = moduleItem.name;
      
      // Direct name match
      if (normalizedResultName === normalizedItemName) return true;
      
      // Specific mappings for edge cases
      const mappings: Record<string, string[]> = {
        'Technical SEO': ['TechnicalSEO', 'Technical SEO'],
        'Schema Markup': ['SchemaMarkup', 'Schema Markup'],
        'AI Content': ['AIContent', 'AI Content'],
        'AI Citation': ['AICitation', 'AI Citation'],
        'Cross-web Presence': ['CrossWebFootprint', 'Cross Web Footprint'],
        'Content Freshness': ['Freshness', 'Content Freshness']
      };
      
      const possibleNames = mappings[normalizedItemName] || [];
      return possibleNames.includes(result.moduleName || result.name || '');
    });
  }

  // Helper functie voor default icons (kan verwijderd worden als we de nieuwe mapping gebruiken)
  function getDefaultIcon(moduleName: string): string {
    const icons: Record<string, string> = {
      'Content': '📝',
      'SEO': '🔍',
      'Performance': '⚡',
      'Accessibility': '♿',
      'Security': '🔒',
      'Mobile': '📱',
      'Social': '🤝',
      'Analytics': '📊'
    };
    return icons[moduleName] || '📊';
  }

  // Convert priority to type for consistent display
  function priorityToType(priority: string): 'success' | 'warning' | 'error' {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'warning';
    }
  }
</script>

<svelte:head>
<title>Scan Resultaten voor {scan.url}</title>
<meta name="description" content="Analyse en AI-readiness score voor {scan.url}" />
</svelte:head>

<Header />

<main class="min-h-screen bg-gradient-to-br from-bg-light via-white to-blue-50">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Header Section -->
  <div class="text-center mb-8">
    <h1 class="text-3xl font-header font-bold text-gray-900 mb-4">
      🎉 Je Scan Resultaten
    </h1>
    <p class="text-lg text-gray-600 mb-6">
      Scan resultaten voor {scan.url}
    </p>
  </div>

  <!-- Error Alert -->
  {#if error}
    <Alert variant="destructive" class="mb-8">
      <AlertDescription>
        <p><strong>Er is een fout opgetreden:</strong> {error}</p>
        <p class="mt-2">Probeer de scan opnieuw uit te voeren. Als het probleem aanhoudt, neem contact op met support.</p>
      </AlertDescription>
    </Alert>
  {/if}

  <!-- Top Section: 50/50 Split -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
    <!-- Left: Website Preview -->
    <div class="space-y-6 order-1 lg:order-1">
      <WebsitePreview 
        websiteUrl={scan.url}
        websiteScreenshot={scan.screenshot || ''}
        statusText="Scan voltooid"
        isLoading={false}
      />
      
      <!-- PDF Status for non-basic tiers -->
      {#if scan.tier !== 'basic'}
        <Alert>
          <AlertDescription>
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">
                  {#if scan.pdfGenerationStatus === 'completed' && scan.pdfUrl}
                    📄
                  {:else if scan.pdfGenerationStatus === 'generating' || scan.pdfGenerationStatus === 'pending'}
                    ⚙️
                  {:else}
                    📧
                  {/if}
                </span>
                <span class="text-sm">
                  {#if scan.pdfGenerationStatus === 'completed' && scan.pdfUrl}
                    PDF rapport is klaar!
                  {:else if scan.pdfGenerationStatus === 'generating' || scan.pdfGenerationStatus === 'pending'}
                    PDF wordt gegenereerd...
                  {:else if emailStatus.email}
                    Rapport wordt naar {emailStatus.email} gestuurd
                  {:else}
                    Rapport wordt klaargezet
                  {/if}
                </span>
              </div>
              
              {#if scan.pdfGenerationStatus === 'completed' && scan.pdfUrl}
                <Button 
                  variant="default" 
                  size="sm"
                  on:click={() => downloadPDF(scan.id, emailStatus.email)}
                  class="w-full sm:w-auto"
                >
                  📄 Download PDF
                </Button>
              {/if}
            </div>
          </AlertDescription>
        </Alert>
      {/if}
    </div>

    <!-- Right: AI-Gereedheid Score -->
    <div class="flex items-center justify-center order-2 lg:order-2">
      <div class="glass p-6 lg:p-8 rounded-2xl text-center w-full max-w-md mx-auto">
        <ProgressCircle 
          progress={scan.overallScore} 
          size={180} 
        />
        <h2 class="text-xl lg:text-2xl font-semibold mt-4 lg:mt-6">AI-Gereedheid Score</h2>
        <p class="text-gray-600 mt-2 text-base lg:text-lg">
          {scan.overallScore} van de 100 punten
        </p>
        <div class="mt-3 lg:mt-4 text-xs lg:text-sm text-gray-500">
          Gebaseerd op {scan.moduleResults ? scan.moduleResults.length : 0} modules
        </div>
      </div>
    </div>
  </div>

  <!-- Results Section -->
  <div class="space-y-8">
    {#if scan.moduleResults && scan.moduleResults.length > 0}
      <!-- Section Header -->
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold mb-2">Gedetailleerde Analyse</h2>
        <p class="text-gray-600">Ontdek wat er goed gaat en waar verbeterkansen liggen</p>
      </div>

      <!-- Module Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        {#each moduleItems as module}
          {@const moduleData = getModuleData(module)}
          {@const hasData = moduleData && moduleData.findings && moduleData.findings.length > 0}
          {@const criticalFindings = hasData ? moduleData.findings.filter(f => (f.priority || 'medium') === 'high' || f.type === 'error') : []}
          {@const positiveFindings = hasData ? moduleData.findings.filter(f => (f.priority || 'medium') === 'low' || f.type === 'success') : []}
          
          <!-- Module Card -->
          <div class="glass rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
            <!-- Card Header -->
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    class:bg-gradient-to-br={module.name.startsWith('AI')}
                    class:from-blue-100={module.name.startsWith('AI')}
                    class:to-purple-100={module.name.startsWith('AI')}
                    class:bg-gray-100={!module.name.startsWith('AI')}
                  >
                    {module.icon}
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">{module.name}</h3>
                    {#if module.name.startsWith('AI')}
                      <span class="text-sm text-blue-600 font-medium">AI Module</span>
                    {/if}
                  </div>
                </div>
                
                <div class="flex items-center gap-2">
                  {#if hasData}
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      Actief
                    </span>
                  {:else}
                    <span class="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                      Ontwikkeling
                    </span>
                  {/if}
                </div>
              </div>

              <!-- Quick Stats -->
              {#if hasData}
                <div class="flex items-center gap-4 text-sm">
                  {#if positiveFindings.length > 0}
                    <div class="flex items-center gap-1 text-green-600">
                      <span>✓</span>
                      <span>{positiveFindings.length} goed</span>
                    </div>
                  {/if}
                  {#if criticalFindings.length > 0}
                    <div class="flex items-center gap-1 text-red-600">
                      <span>⚠</span>
                      <span>{criticalFindings.length} verbeterpunt{criticalFindings.length !== 1 ? 'en' : ''}</span>
                    </div>
                  {/if}
                  <div class="flex items-center gap-1 text-gray-500">
                    <span>📊</span>
                    <span>{moduleData.findings.length} total</span>
                  </div>
                </div>
              {:else}
                <p class="text-sm text-gray-500">Binnenkort beschikbaar</p>
              {/if}
            </div>

            <!-- Card Content -->
            <div class="p-6">
              {#if hasData}
                <!-- Top Findings Preview -->
                <div class="space-y-3">
                  {#each moduleData.findings.slice(0, 3) as finding}
                    {@const displayType = finding.type || priorityToType(finding.priority || 'medium')}
                    <div class="flex items-start gap-3 p-3 rounded-lg" 
                      class:bg-green-50={displayType === 'success'}
                      class:bg-yellow-50={displayType === 'warning'}
                      class:bg-red-50={displayType === 'error'}
                    >
                      <span class="mt-0.5 text-sm">
                        {#if displayType === 'success'}
                          <span class="text-green-500">✓</span>
                        {:else if displayType === 'warning'}
                          <span class="text-yellow-500">⚠️</span>
                        {:else}
                          <span class="text-red-500">✗</span>
                        {/if}
                      </span>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium truncate" 
                          class:text-green-700={displayType === 'success'}
                          class:text-yellow-700={displayType === 'warning'}
                          class:text-red-700={displayType === 'error'}
                        >
                          {finding.title}
                        </p>
                        <p class="text-xs text-gray-600 mt-1 line-clamp-2">
                          {finding.description}
                        </p>
                      </div>
                    </div>
                  {/each}
                  
                  {#if moduleData.findings.length > 3}
                    <button 
                      class="w-full text-center py-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      on:click={() => toggleModule(module.id)}
                    >
                      {expandedStates[module.id] ? '← Toon minder' : `Toon alle ${moduleData.findings.length} bevindingen →`}
                    </button>
                  {/if}
                </div>

                <!-- Expanded Details -->
                {#if expandedStates[module.id] && moduleData.findings.length > 3}
                  <div class="mt-6 pt-6 border-t border-gray-100">
                    <h4 class="text-sm font-semibold text-gray-700 mb-4">Alle Bevindingen</h4>
                    <div class="space-y-3">
                      {#each moduleData.findings.slice(3) as finding}
                        {@const displayType = finding.type || priorityToType(finding.priority || 'medium')}
                        <div class="flex items-start gap-3 p-3 rounded-lg" 
                          class:bg-green-50={displayType === 'success'}
                          class:bg-yellow-50={displayType === 'warning'}
                          class:bg-red-50={displayType === 'error'}
                        >
                          <span class="mt-0.5 text-sm">
                            {#if displayType === 'success'}
                              <span class="text-green-500">✓</span>
                            {:else if displayType === 'warning'}
                              <span class="text-yellow-500">⚠️</span>
                            {:else}
                              <span class="text-red-500">✗</span>
                            {/if}
                          </span>
                          <div class="flex-1">
                            <p class="text-sm font-medium mb-1" 
                              class:text-green-700={displayType === 'success'}
                              class:text-yellow-700={displayType === 'warning'}
                              class:text-red-700={displayType === 'error'}
                            >
                              {finding.title}
                            </p>
                            <p class="text-xs text-gray-600">
                              {finding.description}
                            </p>
                          </div>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}
              {:else}
                <div class="text-center py-8">
                  <div class="text-4xl mb-3">🚧</div>
                  <p class="text-sm text-gray-600">
                    Deze module wordt nog ontwikkeld en komt binnenkort beschikbaar.
                  </p>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="glass p-8 rounded-2xl text-center">
        <div class="text-6xl mb-4">🔍</div>
        <h3 class="text-xl font-semibold mb-2">Geen resultaten beschikbaar</h3>
        <p class="text-gray-600">De scan heeft nog geen resultaten opgeleverd.</p>
      </div>
    {/if}
  </div>

  <!-- Action Buttons -->
  <div class="flex flex-col sm:flex-row justify-center gap-4 mt-12">
    <Button variant="outline" on:click={handleNewScan} class="w-full sm:w-auto">
      🔍 Scan nog een website
    </Button>
    <Button variant="default" on:click={handleUpgrade} class="w-full sm:w-auto">
      🚀 Upgrade voor onbeperkt scannen
    </Button>
  </div>
</div>
</main>