<script context="module" lang="ts">
    export interface TrustItem {
      icon: string;
      text: string;
    }
  </script>
  
  <script lang="ts">
    export let items: TrustItem[] = [
      { icon: 'M9 12l2 2 4-4', text: 'Geen spam - alleen je rapport' },
      { icon: 'M12 6v6l4 2', text: 'Direct in je inbox - binnen 30 seconden' },
      {
        icon: 'M3 11h18v11a2 2 0 01-2 2H5a2 2 0 01-2-2V11z',
        text: 'GDPR-compliant & veilig',
      },
    ];
  </script>
  
  <div class="trust-indicators">
    {#each items as item}
      <div class="trust-item">
        <svg
          class="trust-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d={item.icon}></path>
        </svg>
        <span>{item.text}</span>
      </div>
    {/each}
  </div>
  
  <style>
    .trust-indicators {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
  
    .trust-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: var(--text-gray);
    }
  
    .trust-icon {
      width: 16px;
      height: 16px;
      color: var(--success-green);
      flex-shrink: 0;
    }
  </style>