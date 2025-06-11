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
      name: string;
      icon?: string;
      score: number;
      findings: Array<{
        type: 'success' | 'warning' | 'error';
        message: string;
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

    // Convert modules to progress grid format
    const moduleItems: ModuleItem[] = scan.moduleResults.map((m, index) => ({
      id: m.id || `module-${index}`, // Fallback naar index als id ontbreekt
      name: m.name,
      icon: m.icon || getDefaultIcon(m.name),
      status: 'complete' as const
    }));

    // Helper functie voor default icons
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
            color="var(--primary-blue)"
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
        <ModuleProgressGrid modules={moduleItems} />
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