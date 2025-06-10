<!-- src/lib/components/features/scan/ActivityLog.svelte -->
<script context="module" lang="ts">
  export interface ActivityItem {
    text: string;
    status?: 'success' | 'error' | 'pending';
  }
</script>

<script lang="ts">
  import { flyAndScale } from '$lib/utils';
  export let items: ActivityItem[] = [];
</script>

<div class="glass p-4 rounded-2xl text-sm">
  <h3 class="text-sm font-medium text-gray-600 mb-2">Live Activity Log</h3>
  <ul class="space-y-1 max-h-40 overflow-auto text-gray-700 text-xs font-mono pr-1">
    {#each items as item (item.text)}
      <li
        class="flex items-start gap-2"
        in:flyAndScale={{ y: 5 }}
      >
        {#if item.status === 'success'}
          <svg class="w-3 h-3 text-success-green mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        {:else if item.status === 'error'}
          <svg class="w-3 h-3 text-accent-red mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
          </svg>
        {:else}
          <svg class="w-3 h-3 text-secondary-yellow mt-0.5 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
        {/if}
        <span class="leading-tight">{item.text}</span>
      </li>
    {/each}
  </ul>
</div>