<!-- src/lib/components/features/scan/StatusIndicators.svelte -->
<script context="module" lang="ts">
  export interface StatusInfo {
    label: string;
    range: string;
    color: 'green' | 'yellow' | 'red';
  }
</script>

<script lang="ts">
  export let statuses: StatusInfo[] = [
    { label: 'Goed', range: '85-100%', color: 'green' },
    { label: 'Aandacht', range: '60-84%', color: 'yellow' },
    { label: 'Kritiek', range: '0-59%', color: 'red' }
  ];

  const icons: Record<'green' | 'yellow' | 'red', string> = {
    green: `<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>`,
    yellow: `<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>`,
    red: `<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>`
  };
</script>

<div class="grid grid-cols-3 gap-4">
  {#each statuses as status}
    <div class="status-box status-box-{status.color}">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        {@html icons[status.color]}
      </svg>
      <div class="font-medium text-{status.color}-700">{status.label}</div>
      <div class="text-xs text-{status.color}-600">{status.range}</div>
    </div>
  {/each}
</div>
  
<style>
  .status-box {
    background-color: #ecfdf5;
    border: 2px solid #d1fae5;
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: center;
  }
  .status-box-yellow {
    background-color: #fffbeb;
    border-color: #fef3c7;
  }
  .status-box-red {
    background-color: #fef2f2;
    border-color: #fee2e2;
  }
  .status-box svg {
    margin: 0 auto 0.5rem;
  }
  .status-box-green svg {
    color: #10b981;
  }
  .status-box-yellow svg {
    color: #f59e0b;
  }
  .status-box-red svg {
    color: #ef4444;
  }
</style>