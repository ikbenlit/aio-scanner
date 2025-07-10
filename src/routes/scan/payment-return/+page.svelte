<!-- src/routes/scan/payment-return/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  
  const tier = $page.url.searchParams.get('tier');
  const email = $page.url.searchParams.get('email');
  const scanUrl = $page.url.searchParams.get('url');
  // Mollie typically adds 'id' parameter containing the payment ID
  let paymentId = $page.url.searchParams.get('id') || $page.url.searchParams.get('paymentId');
  
  let status = 'Betaling wordt geverifieerd...';
  let isProcessing = true;
  let error = null;
  
  onMount(async () => {
    // Validate required parameters
    if (!tier || !email || !scanUrl) {
      error = 'Ontbrekende parameters voor het starten van de scan. Controleer de URL en probeer opnieuw.';
      isProcessing = false;
      return;
    }
    
    // Check if paymentId is missing
    if (!paymentId) {
      console.warn('⚠️ PaymentId missing - mogelijk directe toegang of Mollie fout');
      
      // Development override: Allow testing without payment
      const isDevelopment = window.location.hostname === 'localhost';
      if (isDevelopment) {
        console.log('🧪 Development mode: Using mock paymentId voor testing');
        // Use Mollie-compatible test payment ID format with email encoded
        const emailEncoded = email.replace('@', '--').replace(/\./g, '-');
        paymentId = `tr_test_${Date.now()}_${emailEncoded}`;
      } else {
        error = 'Betalingsverificatie mislukt. Geen payment ID ontvangen van Mollie. Probeer de betaling opnieuw of neem contact op met support.';
        isProcessing = false;
        return;
      }
    }
    
    try {
      status = 'Betaling wordt geverifieerd, scan wordt gestart...';
      
      console.log('🔄 Starting scan after payment:', { tier, email, scanUrl, paymentId });
      
      // Start the scan directly using the existing scan API
      const response = await fetch(`/api/scan/${tier}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url: scanUrl, 
          email: email,
          paymentId: paymentId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scan kon niet worden gestart');
      }
      
      const result = await response.json();
      console.log('✅ Scan started successfully:', result);
      
      if (result.scanId) {
        status = 'Betaling succesvol! Scan is gestart, je wordt doorgestuurd...';
        isProcessing = false; // Show success state briefly
        
        // Show success message, then redirect
        setTimeout(() => {
          goto(`/scan/${result.scanId}/results`);
        }, 2000);
      } else {
        throw new Error('Geen scan ID ontvangen van de server');
      }
      
    } catch (err) {
      console.error('❌ Payment return scan error:', err);
      error = err.message || 'Er is een fout opgetreden bij het starten van de scan. Probeer het opnieuw of neem contact op met support.';
      isProcessing = false;
    }
  });
</script>
  
<div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
  <div class="max-w-md w-full">
    <div class="bg-white rounded-xl shadow-lg p-8 text-center">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">
        Betaling Voltooid
      </h1>
      
      {#if error}
        <!-- Error State -->
        <div class="mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-red-600 mb-2">Er is een probleem opgetreden</h2>
          <p class="text-gray-600 mb-6">{error}</p>
          <div class="space-y-3">
            <a href="/" class="inline-block w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-center">
              Terug naar startpagina
            </a>
            <a href="/#pricing" class="inline-block w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors text-center">
              Opnieuw proberen
            </a>
          </div>
        </div>
      {:else if isProcessing}
        <!-- Processing State -->
        <div class="mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Scan wordt gestart</h2>
          <p class="text-gray-600 mb-4">{status}</p>
        </div>
      {:else}
        <!-- Success State -->
        <div class="mb-6">
          <div class="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 class="text-lg font-semibold text-green-600 mb-2">Succesvol!</h2>
          <p class="text-gray-600 mb-4">{status}</p>
          
          <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <div class="text-sm text-green-700">
                <p class="font-medium">Je wordt automatisch doorgestuurd naar de live resultaten waar je de scan kunt volgen.</p>
              </div>
            </div>
          </div>
        </div>
      {/if}
      
      <!-- Order Summary -->
      <div class="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 class="font-medium text-gray-900 mb-3">Bestelling overzicht</h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-600">Pakket:</span>
            <span class="font-medium capitalize">{tier}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Email:</span>
            <span class="font-medium">{email}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Website:</span>
            <span class="font-medium text-xs break-all">{scanUrl}</span>
          </div>
          {#if paymentId}
            <div class="flex justify-between">
              <span class="text-gray-600">Payment ID:</span>
              <span class="font-mono text-xs">{paymentId}</span>
            </div>
          {/if}
        </div>
      </div>
      
      <!-- Help & Next Steps -->
      <div class="bg-blue-50 rounded-lg p-4 mb-4">
        <h4 class="font-medium text-gray-900 mb-2">Wat gebeurt er nu?</h4>
        <ol class="text-sm text-gray-600 space-y-1">
          <li class="flex items-start">
            <span class="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">1</span>
            Je scan is gestart en loopt ±60 seconden
          </li>
          <li class="flex items-start">
            <span class="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">2</span>
            Je kunt de voortgang live volgen op de resultatenpagina
          </li>
          <li class="flex items-start">
            <span class="inline-block w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">3</span>
            Het volledige PDF-rapport wordt naar je e-mail verzonden
          </li>
        </ol>
      </div>
      
      <!-- Support Info -->
      <p class="text-sm text-gray-500 text-center">
        Heb je vragen? Neem contact op met support en vermeld bovenstaande order details.
      </p>
    </div>
  </div>
</div>
  
<svelte:head>
  <title>Betaling Voltooid - AIO Scanner</title>
  <meta name="description" content="Je betaling is voltooid, scan wordt gestart" />
</svelte:head>