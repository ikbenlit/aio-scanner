<!-- src/routes/checkout/+page.svelte -->
<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  
  let tier = '';
  let scanUrl = '';
  let email = '';
  let isLoading = false;
  let error = '';
  
  onMount(() => {
    // Get parameters from URL
    tier = $page.url.searchParams.get('tier') || '';
    scanUrl = $page.url.searchParams.get('url') || '';
    email = $page.url.searchParams.get('email') || '';
  });
  
  // Tier configuration
  const tierConfig = {
    starter: {
      name: 'Starter',
      price: '€19,95',
      description: 'Ideaal voor kleine bedrijven en freelancers',
      features: [
        'Alle Basic-functies',
        'AI-gegenereerd content rapport',
        'Downloadbare PDF-rapporten',
        'E-mail ondersteuning'
      ]
    },
    business: {
      name: 'Business',
      price: '€49,95',
      description: 'Voor MKB en marketing professionals',
      features: [
        'Alle Starter-functies',
        'AI-auteur voor content verbetering',
        'Volledig narratief PDF-rapport',
        'Analyse van de versheid van content'
      ]
    },
    enterprise: {
      name: 'Enterprise',
      price: '€149,95',
      description: 'Voor bureaus en grote ondernemingen',
      features: [
        'Alle Business-functies',
        'Multi-pagina scan & analyse',
        'Concurrentie-analyse',
        'Strategische roadmap'
      ]
    }
  };
  
  $: selectedTier = tierConfig[tier];
  $: isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  $: canProceed = selectedTier && scanUrl && isValidEmail;
  
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
      
      const data = await response.json();
      console.log('💳 Payment created:', data);
      
      // Redirect to payment URL
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('No payment URL received');
      }
      
    } catch (err) {
      console.error('Payment error:', err);
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
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="je@email.com"
                />
                <p class="text-sm text-gray-500 mt-1">
                  Je rapport wordt naar dit adres verzonden
                </p>
              </div>
              
              <div>
                <label for="scan-url" class="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  id="scan-url"
                  type="url"
                  bind:value={scanUrl}
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://jouwwebsite.nl"
                />
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
            
            <div class="mt-6 text-center">
              <p class="text-sm text-gray-500">
                Veilige betaling via Mollie
              </p>
              <div class="flex justify-center mt-2 space-x-4">
                <span class="text-xs text-gray-400">iDEAL • Credit Card • SEPA</span>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</div>