<!-- src/lib/components/features/scan/WebsitePreview.svelte -->
<script lang="ts">
  export let websiteUrl: string;
  export let websiteScreenshot: string = '';
  export let statusText: string = 'AI-analyse voltooid';
  export let isLoading: boolean = false;
  export let loadingText: string = 'Screenshot wordt gemaakt...';

  // Verbeterde fallback screenshot met website naam
  const generateFallbackScreenshot = (url: string): string => {
    let domain = 'voorbeeld.nl';
    
    try {
      if (url && url.trim()) {
        // Voeg protocol toe als het ontbreekt
        const urlToTest = url.startsWith('http') ? url : `https://${url}`;
        domain = new URL(urlToTest).hostname;
      }
    } catch (error) {
      // Fallback naar default bij invalid URL
      console.warn('Invalid URL for screenshot generation:', url);
      domain = 'voorbeeld.nl';
    }
    const svgContent = `
      <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2E9BDA;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e7ba8;stop-opacity:1" />
          </linearGradient>
        </defs>
        <!-- Header bar -->
        <rect width="400" height="40" fill="url(#bg)"/>
        <circle cx="20" cy="20" r="6" fill="rgba(255,255,255,0.3)"/>
        <circle cx="35" cy="20" r="6" fill="rgba(255,255,255,0.3)"/>
        <circle cx="50" cy="20" r="6" fill="rgba(255,255,255,0.3)"/>
        <text x="80" y="25" fill="white" font-family="Arial" font-size="12" font-weight="bold">${domain}</text>
        
        <!-- Content area -->
        <rect x="0" y="40" width="400" height="160" fill="#f8f9fa"/>
        
        <!-- Mock content -->
        <rect x="20" y="60" width="360" height="20" fill="#e2e8f0" rx="4"/>
        <rect x="20" y="90" width="250" height="12" fill="#cbd5e1" rx="2"/>
        <rect x="20" y="110" width="300" height="12" fill="#cbd5e1" rx="2"/>
        
        <!-- Mock buttons -->
        <rect x="20" y="140" width="80" height="30" fill="#2E9BDA" rx="4"/>
        <text x="60" y="158" fill="white" font-family="Arial" font-size="10" text-anchor="middle">Contact</text>
        
        <rect x="110" y="140" width="80" height="30" fill="#f1f5f9" stroke="#e2e8f0" rx="4"/>
        <text x="150" y="158" fill="#475569" font-family="Arial" font-size="10" text-anchor="middle">Meer info</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svgContent)}`;
  };

  $: displayScreenshot = websiteScreenshot || generateFallbackScreenshot(websiteUrl || '');
  $: displayStatusText = isLoading ? loadingText : statusText;
</script>

<div class="w-full h-[300px] flex items-center justify-center">
  <div class="bg-white rounded-xl shadow-md flex flex-col items-start justify-center p-6 w-full h-full min-h-[220px]">
    
    <!-- Website URL en status -->
    <div class="flex items-center gap-3 mb-2">
      <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
        {#if isLoading}
          <div class="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        {:else}
          <span class="text-xl">🌐</span>
        {/if}
      </div>
      <a 
        href={websiteUrl} 
        target="_blank" 
        rel="noopener" 
        class="font-medium text-blue-600 hover:underline break-all text-sm"
      >
        {websiteUrl}
      </a>
    </div>
    
    <!-- Status text -->
    <div class="text-green-600 text-sm font-medium mb-4">
      {displayStatusText}
    </div>
    
    <!-- Screenshot/Preview -->
    <div class="relative w-full flex-1 min-h-[140px] rounded-lg overflow-hidden border">
      <img 
        src={displayScreenshot} 
        alt="Website screenshot" 
        class="w-full h-full object-cover"
        class:opacity-50={isLoading}
      />
      
      <!-- Loading overlay -->
      {#if isLoading}
        <div class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <div class="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-sm text-gray-600">Screenshot wordt gemaakt...</span>
          </div>
        </div>
      {/if}
      
      <!-- Success indicator -->
      {#if !isLoading && websiteScreenshot}
        <div class="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </div>
      {/if}
    </div>
    
  </div>
</div>

<style>
  /* Custom loading spinner */
  .border-3 {
    border-width: 3px;
  }
</style>