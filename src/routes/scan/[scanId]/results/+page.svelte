<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Header from '$lib/components/layout/Header.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Alert, AlertDescription } from '$lib/components/ui/alert';
  import ProgressCircle from '$lib/components/features/scan/ProgressCircle.svelte';
  import ModuleProgressGrid from '$lib/components/features/scan/ModuleProgressGrid.svelte';
  import StatusIndicators from '$lib/components/features/scan/StatusIndicators.svelte';
  import type { ModuleItem } from '$lib/components/features/scan/ModuleProgressGrid.svelte';
  
  interface ScanModule {
    id?: string;
    moduleName: string;
    icon?: string;
    score: number;
    findings: Array<{
      type: 'success' | 'warning' | 'error';
      title: string;
      description: string;
    }>;
  }

  interface PageData {
    scan: {
      id: string;
      url: string;
      status: string;
      overallScore: number;
      moduleResults: ScanModule[];
      createdAt: string;
      completedAt: string;
    };
    emailStatus: {
      email: string | null;
      sentAt: string | null;
    };
  }
  
  export let data: PageData;
  const { scan, emailStatus } = data;
  
  console.log('Scan module results:', scan.moduleResults);
  
  // Format email sent time
  const emailSentTime = emailStatus.sentAt 
    ? new Date(emailStatus.sentAt).toLocaleTimeString('nl-NL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    : null;

  function handleNewScan() {
    goto('/');
  }

  function handleUpgrade() {
    goto('/upgrade');
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
</script>

<svelte:head>
<title>Scan Resultaten - AIO Scanner</title>
<meta name="description" content="Je AI-gereedheid scan resultaten zijn beschikbaar." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gradient-to-br from-bg-light via-white to-blue-50">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Header Section -->
  <div class="text-center mb-12">
    <h1 class="text-3xl font-header font-bold text-gray-900 mb-4">
      🎉 Je Scan Resultaten
    </h1>
    <p class="text-lg text-gray-600">
      Scan resultaten voor {scan.url}
    </p>
  </div>

  <!-- Email Status Alert -->
  {#if emailStatus.email}
    <Alert class="mb-8">
      <AlertDescription>
        <div class="flex items-center gap-2">
          <span class="text-xl">📧</span>
          <span>
            Een uitgebreid PDF rapport is onderweg naar <strong>{emailStatus.email}</strong>
            {#if emailSentTime}
              (verzonden om {emailSentTime})
            {/if}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  {/if}

  <!-- Results Grid -->
  <div class="grid lg:grid-cols-2 gap-8 mb-12">
    <!-- Left Column: Score & Status -->
    <div class="space-y-8">
      <!-- Score Circle -->
      <div class="glass p-8 rounded-2xl text-center">
        <ProgressCircle 
          progress={scan.overallScore} 
          size={192} 
        />
        <h2 class="text-xl font-semibold mt-4">AI-Gereedheid Score</h2>
        <p class="text-gray-600 mt-2">
          Je website scoort {scan.overallScore} van de 100 punten
        </p>
      </div>

      <!-- Status Indicators -->
      <div class="glass p-8 rounded-2xl">
        <StatusIndicators />
      </div>
    </div>

    <!-- Right Column: Module Results -->
    <div class="glass p-8 rounded-2xl">
      <h2 class="text-xl font-semibold mb-6">Gedetailleerde Resultaten</h2>
      
      {#each moduleItems as module}
        <div class="mb-6 last:mb-0">
          <!-- Module Header - Clickable -->
          <button 
            class="w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:shadow-sm"
            class:bg-gradient-to-r={module.name.startsWith('AI')}
            class:from-blue-50={module.name.startsWith('AI')}
            class:to-purple-50={module.name.startsWith('AI')}
            class:bg-gray-50={!module.name.startsWith('AI')}
            on:click={() => toggleModule(module.id)}
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">{module.icon}</span>
              <div class="text-left">
                <h3 class="text-lg font-medium text-gray-900">{module.name}</h3>
                {#if module.name.startsWith('AI')}
                  <span class="text-sm text-blue-600 font-medium">AI Module</span>
                {/if}
              </div>
            </div>
            
            <div class="flex items-center gap-3">
              {#if module.id === 'technical_seo' || module.id === 'schema_markup' || module.id === 'ai_content' || module.id === 'ai_citation'}
                <span class="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                  Geïmplementeerd
                </span>
              {:else}
                <span class="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-700">
                  In ontwikkeling
                </span>
              {/if}
              
              <!-- Chevron Icon -->
              <svg 
                class="w-5 h-5 text-gray-400 transition-transform duration-200"
                class:rotate-180={expandedStates[module.id]}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          <!-- Module Content - Collapsible -->
          {#if expandedStates[module.id]}
            <div class="mt-4 pl-4 border-l-2 border-gray-100">
              {#if module.id === 'technical_seo' || module.id === 'schema_markup' || module.id === 'ai_content' || module.id === 'ai_citation'}
                {#each scan.moduleResults.filter(m => {
                  console.log('Checking module:', m.moduleName, 'against', module.id);
                  return (
                    (module.id === 'technical_seo' && m.moduleName === 'Technical SEO') ||
                    (module.id === 'schema_markup' && m.moduleName === 'Schema Markup') ||
                    (module.id === 'ai_content' && m.moduleName === 'AI Content') ||
                    (module.id === 'ai_citation' && m.moduleName === 'AI Citation')
                  );
                }) as result}
                  {#if result.findings && result.findings.length > 0}
                    <div class="space-y-3">
                      {#each result.findings as finding}
                        <div class="flex items-start gap-3 p-4 rounded-lg" 
                          class:bg-green-50={finding.type === 'success'}
                          class:bg-yellow-50={finding.type === 'warning'}
                          class:bg-red-50={finding.type === 'error'}
                        >
                          <span class="mt-0.5 text-lg">
                            {#if finding.type === 'success'}
                              <span class="text-green-500">✓</span>
                            {:else if finding.type === 'warning'}
                              <span class="text-yellow-500">⚠️</span>
                            {:else}
                              <span class="text-red-500">✗</span>
                            {/if}
                          </span>
                          <div class="flex-1">
                            <p class="text-sm font-medium mb-1" 
                              class:text-green-700={finding.type === 'success'}
                              class:text-yellow-700={finding.type === 'warning'}
                              class:text-red-700={finding.type === 'error'}
                            >
                              {finding.title}
                            </p>
                            <p class="text-sm" 
                              class:text-green-600={finding.type === 'success'}
                              class:text-yellow-600={finding.type === 'warning'}
                              class:text-red-600={finding.type === 'error'}
                            >
                              {finding.description}
                            </p>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <p class="text-sm text-gray-500 italic p-4">Geen specifieke bevindingen voor deze module.</p>
                  {/if}
                {/each}
              {:else}
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600">
                    Deze module is momenteel in ontwikkeling. Binnenkort beschikbaar!
                  </p>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>
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