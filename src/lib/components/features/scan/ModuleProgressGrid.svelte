<!-- src/lib/components/features/scan/ModuleProgressGrid.svelte -->
<script context="module" lang="ts">
  export interface ModuleItem {
    id: string;
    name: string;
    icon: string;
    status?: 'pending' | 'scanning' | 'complete';
  }
</script>

<script lang="ts">
  export let modules: ModuleItem[] = [];
</script>
  
<div class="glass p-6 rounded-2xl text-sm">
  <h3 class="text-sm font-medium text-gray-600 mb-2">AI-Modules Scan Voortgang</h3>
  <ul class="divide-y divide-border-gray">
    {#each modules as module (module.id)}
      <li
        class="flex items-center justify-between py-2 {module.status === 'pending' ? 'opacity-30' : ''} {module.status === 'scanning' ? 'bg-primary-blue/5' : ''} {module.status === 'complete' ? 'text-success-green' : ''}"
      >
        <div class="flex items-center gap-2">
          <span class="text-lg">{module.icon}</span>
          <span class="font-medium text-gray-700">{module.name}</span>
        </div>
        <div class="flex items-center">
          {#if module.status === 'scanning'}
            <svg class="w-4 h-4 animate-spin text-primary-blue" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {:else if module.status === 'complete'}
            <svg class="w-4 h-4 text-success-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          {/if}
        </div>
      </li>
    {/each}
  </ul>
</div>