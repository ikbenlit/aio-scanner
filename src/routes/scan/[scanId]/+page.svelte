<!-- src/routes/scan/[scanId]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import Header from '$lib/components/layout/Header.svelte';
  import ModuleProgressGrid from '$lib/components/features/scan/ModuleProgressGrid.svelte';
  import ActivityLog from '$lib/components/features/scan/ActivityLog.svelte';
  import ProgressCircle from '$lib/components/features/scan/ProgressCircle.svelte';
  import WebsitePreview from '$lib/components/features/scan/WebsitePreview.svelte';
  import { Button } from '$lib/components/ui/button';

  // Get scanId from URL
  const scanId = $page.params.scanId;
  const urlToScan = $page.url.searchParams.get('url') || 'jouwwebsite.nl';

  // Mock data voor MVP
  const modules = [
    { id: 'content', name: 'AI Content Analysis', icon: '🤖', status: 'scanning' as const },
    { id: 'technical', name: 'Technical SEO', icon: '🔍', status: 'pending' as const },
    { id: 'schema', name: 'Schema Markup', icon: '📝', status: 'pending' as const },
    { id: 'presence', name: 'Cross-web Presence', icon: '🌐', status: 'pending' as const },
    { id: 'authority', name: 'Authority & Citations', icon: '🏆', status: 'pending' as const },
    { id: 'freshness', name: 'Content Freshness', icon: '🔄', status: 'pending' as const },
    { id: 'multimodal', name: 'Multimodal', icon: '📱', status: 'pending' as const },
    { id: 'monitoring', name: 'Monitoring Hooks', icon: '📊', status: 'pending' as const }
  ];

  const activityItems = [
    { text: 'robots.txt checked', status: 'success' as const },
    { text: 'Sitemap.xml found', status: 'success' as const },
    { text: 'Checking structured data...', status: 'pending' as const }
  ];

  // Mock scan data
  const scanData = {
    progress: 25,
    estimatedTime: 15,
    url: urlToScan
  };
</script>

<svelte:head>
  <title>Scanning... - AIO Scanner</title>
  <meta name="description" content="Real-time AI scan van je website in progress." />
</svelte:head>

<Header />

<main class="min-h-screen bg-gradient-to-br from-bg-light via-white to-blue-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    <!-- Scan Header -->
    <div class="text-center mb-12">
      <h1 class="text-3xl font-header font-bold text-gray-900 mb-4">
        AI Scan in Progress
      </h1>
      <p class="text-lg text-gray-600">
        We analyseren je website voor AI-vindbaarheid...
      </p>
    </div>

    <!-- Main Content Grid -->
    <div class="grid lg:grid-cols-2 gap-8">
      <!-- Left Column: Progress & Status -->
      <div class="space-y-8">
        <!-- Progress Circle -->
        <div class="glass p-8 rounded-2xl text-center">
          <ProgressCircle 
            progress={scanData.progress} 
            size={192}
            strokeWidth={8}
          />
          <p class="text-gray-600 mt-4">
            Geschatte tijd: ~{scanData.estimatedTime} seconden
          </p>
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
            <WebsitePreview websiteUrl={scanData.url} />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-end gap-4">
          <Button variant="outline" class="w-full sm:w-auto">
            Scan Annuleren
          </Button>
          <Button variant="default" class="w-full sm:w-auto">
            Resultaten Bekijken
          </Button>
        </div>
      </div>
    </div>
  </div>
</main> 