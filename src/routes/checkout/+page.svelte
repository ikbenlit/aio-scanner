<!-- src/routes/checkout/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  
  export let data: PageData;
  
  // Extract data from load function
  let { tier, scanUrl, tierConfig } = data;
  let email = data.email;
  let isLoading = false;
  let error = '';
  
  $: selectedTier = tierConfig[tier as keyof typeof tierConfig];
  $: isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $: isValidUrl = scanUrl && isValidUrlFormat(scanUrl);
  $: canProceed = selectedTier && isValidUrl && isValidEmail;
  
  function isValidUrlFormat(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  
  function formatUrl(url: string): string {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return 'https://' + url;
    }
    return url;
  }
  
  // Auto-format URL when user types
  function handleUrlInput(event: Event) {
    const target = event.target as HTMLInputElement;
    scanUrl = formatUrl(target.value);
  }
  
  async function handlePayment() {
    if (!canProceed || isLoading) return;
    
    try {
      isLoading = true;
      error = '';
      
      console.log('🛒 Creating payment for:', { tier, email, scanUrl });
      
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tier,
          email,
          scanUrl
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment creation failed');
      }
      
      const result = await response.json();
      console.log('💳 Payment created:', result);
      
      // Redirect to payment URL  
      if (result.paymentUrl) {
        console.log('🔄 Redirecting to payment URL:', result.paymentUrl);
        window.location.href = result.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
      
    } catch (err: any) {
      console.error('💥 Payment error:', err);
      error = err.message || 'Er is iets misgegaan bij het verwerken van de betaling';
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Checkout - AIO Scanner</title>
  <meta name="description" content="Voltooi je bestelling voor de AIO Scanner analyse" />
</svelte:head>

<div class="min-h-screen bg-gray-50 py-12">
  <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
    <div class="bg-white rounded-xl shadow-lg p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
        Bestelling afronden
      </h1>
      
      {#if !selectedTier}
        <div class="text-center">
          <p class="text-red-600 mb-4">Ongeldige tier geselecteerd</p>
          <a href="/" class="text-blue-600 hover:text-blue-500">
            Terug naar startpagina
          </a>
        </div>
      {:else}
        <div class="grid md:grid-cols-2 gap-8">
          <!-- Order Summary -->
          <div class="bg-gray-50 rounded-lg p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Bestelling overzicht
            </h2>
            
            <div class="space-y-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Pakket:</span>
                <span class="font-medium">{selectedTier.name}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600">Prijs:</span>
                <span class="font-medium">{selectedTier.price}</span>
              </div>
              
              <div class="flex justify-between">
                <span class="text-gray-600">Website:</span>
                <span class="font-medium text-sm break-all">{scanUrl}</span>
              </div>
              
              <hr class="border-gray-200">
              
              <div class="flex justify-between text-lg font-semibold">
                <span>Totaal:</span>
                <span>{selectedTier.price}</span>
              </div>
            </div>
            
            <div class="mt-6">
              <h3 class="font-medium text-gray-900 mb-3">Inbegrepen:</h3>
              <ul class="space-y-2">
                {#each selectedTier.features as feature}
                  <li class="flex items-start">
                    <svg class="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-sm text-gray-700">{feature}</span>
                  </li>
                {/each}
              </ul>
            </div>
          </div>
          
          <!-- Payment Form -->
          <div>
            <h2 class="text-xl font-semibold text-gray-900 mb-4">
              Betaalgegevens
            </h2>
            
            <form on:submit|preventDefault={handlePayment} class="space-y-4">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                  E-mailadres
                </label>
                <input
                  id="email"
                  type="email"
                  bind:value={email}
                  required
                  class="w-full px-3 py-2 border {isValidEmail || !email ? 'border-gray-300' : 'border-red-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="je@email.com"
                />
                {#if email && !isValidEmail}
                  <p class="text-sm text-red-600 mt-1">Voer een geldig e-mailadres in</p>
                {/if}
                <p class="text-sm text-gray-500 mt-1">
                  Je rapport wordt naar dit adres verzonden
                </p>
              </div>
              
              <div>
                <label for="scan-url" class="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <div class="relative">
                  <input
                    id="scan-url"
                    type="url"
                    bind:value={scanUrl}
                    on:input={handleUrlInput}
                    required
                    class="w-full px-3 py-2 border {isValidUrl || !scanUrl ? 'border-gray-300' : 'border-red-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="bijv. mijnwebsite.nl"
                  />
                  {#if isValidUrl}
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  {/if}
                </div>
                {#if scanUrl && !isValidUrl}
                  <p class="text-sm text-red-600 mt-1">Voer een geldige URL in</p>
                {:else if scanUrl && isValidUrl && !scanUrl.startsWith('http')}
                  <p class="text-sm text-green-600 mt-1">✓ Automatisch geformatteerd naar: https://{scanUrl}</p>
                {:else if scanUrl && isValidUrl}
                  <p class="text-sm text-green-600 mt-1">✓ Geldige URL</p>
                {/if}
              </div>
              
              {#if error}
                <div class="bg-red-50 border border-red-200 rounded-md p-4">
                  <p class="text-sm text-red-600">{error}</p>
                </div>
              {/if}
              
              <button
                type="submit"
                disabled={!canProceed || isLoading}
                class="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if isLoading}
                  <span class="flex items-center justify-center">
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Bezig met verwerken...
                  </span>
                {:else}
                  Ga naar betaling
                {/if}
              </button>
            </form>
            
            <!-- Process Info -->
            <div class="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2">Wat gebeurt er na betaling?</h4>
              <ol class="text-sm text-gray-600 space-y-1">
                <li>1. Je betaling wordt direct geverifieerd</li>
                <li>2. De scan start automatisch (±60 seconden)</li>
                <li>3. Je wordt doorgestuurd naar de live resultaten</li>
                <li>4. Het volledige PDF-rapport wordt naar je e-mail verzonden</li>
              </ol>
            </div>
            
            <!-- Trust Signals -->
            <div class="mt-6 text-center">
              <p class="text-sm text-gray-500 mb-2">
                🔒 Veilige betaling via Mollie
              </p>
              <div class="flex justify-center mt-2 space-x-4 text-xs text-gray-400">
                <span>iDEAL</span>
                <span>•</span>
                <span>Credit Card</span>
                <span>•</span>
                <span>SEPA</span>
              </div>
              <div class="flex justify-center mt-3 space-x-6 text-xs text-gray-500">
                <div class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                  30-dagen geld terug
                </div>
                <div class="flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                  </svg>
                  GDPR compliant
                </div>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>