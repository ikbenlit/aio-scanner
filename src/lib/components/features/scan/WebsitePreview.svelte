<!-- src/lib/components/features/scan/WebsitePreview.svelte -->
<script lang="ts">
    export let websiteUrl: string;
    export let websiteScreenshot: string = '';
    export let statusText: string = 'AI-analyse voltooid';
  
    const defaultScreenshot =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMkU5QkRBIi8+PHRleHQgeD0iMjAiIHk9IjI4IiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+S2VlbCBqZSBqdWdvPC90ZXh0Pjwvc3ZnPg==';
  </script>
  
  <div class="w-full h-[300px] flex items-center justify-center">
    <div class="bg-white rounded-xl shadow-md flex flex-col items-start justify-center p-6 w-full h-full min-h-[220px]">
      <div class="flex items-center gap-3 mb-2">
        <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <span class="text-xl">🌐</span>
        </div>
        <a href={websiteUrl} target="_blank" rel="noopener" class="font-medium text-blue-600 hover:underline break-all">{websiteUrl}</a>
      </div>
      <div class="text-green-600 text-sm font-medium">{statusText}</div>
      {#if websiteScreenshot}
        <img src={websiteScreenshot} alt="Website screenshot" class="rounded-lg mt-4 w-full h-40 object-cover border" />
      {/if}
    </div>
  </div>

  <style>
    /* Extra styling indien nodig */
  </style>