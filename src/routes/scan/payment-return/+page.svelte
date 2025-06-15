<!-- src/routes/scan/payment-return/+page.svelte -->
 
<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    
    const tier = $page.url.searchParams.get('tier');
    const email = $page.url.searchParams.get('email');
    const scanUrl = $page.url.searchParams.get('url');
    
    let status = 'Checking payment...';
    
    onMount(() => {
      // For now, just show success
      setTimeout(() => {
        status = 'Payment successful! Ready to start scan.';
      }, 1000);
    });
  </script>
  
  <div class="container">
    <h1>Payment Complete</h1>
    
    <div class="info">
      <p><strong>Tier:</strong> {tier}</p>
      <p><strong>Email:</strong> {email}</p>
      {#if scanUrl}
        <p><strong>URL to scan:</strong> {scanUrl}</p>
      {/if}
    </div>
    
    <div class="status">
      <p>{status}</p>
    </div>
    
    {#if status.includes('successful')}
      <button>Start Scan Now</button>
    {/if}
  </div>
  
  <style>
    .container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      text-align: center;
    }
    
    .info {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      margin: 1rem 0;
    }
    
    button {
      background: #2E9BDA;
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
    }
  </style>