<!-- src/lib/components/features/landing/PricingSection.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  
  const dispatch = createEventDispatcher();
  
  let scanUrl = '';
  let email = '';
  let selectedTier = null;
  let showEmailInput = false;
  let urlError = '';
  let emailError = '';
  let isLoading = false;
  
  // URL validatie
  $: isValidUrl = validateUrl(scanUrl);
  $: isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  function validateUrl(url) {
    if (!url) {
      urlError = '';
      return false;
    }
    
    try {
      // Auto-add https if missing
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      new URL(fullUrl);
      urlError = '';
      return true;
    } catch {
      urlError = 'Voer een geldige website URL in';
      return false;
    }
  }
  
  function formatUrl(url) {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  }
  
  async function handleTierClick(tier) {
    // Eerst URL validatie - verplicht voor ALLE tiers
    if (!isValidUrl) {
      urlError = 'Voer eerst een geldige website URL in';
      return;
    }
    
    if (isLoading) return;
    
    try {
      isLoading = true;
      
      if (tier.id === 'basic') {
        // Gratis scan - alleen URL nodig
        console.log('🚀 Starting free scan for:', formatUrl(scanUrl));
        dispatch('startBasicScan', { url: formatUrl(scanUrl) });
      } else {
        // Betaalde tiers
        if (!showEmailInput || selectedTier !== tier.id) {
          // Toon email input
          selectedTier = tier.id;
          showEmailInput = true;
          emailError = '';
          isLoading = false;
          return;
        }
        
        // Email validatie voor betaalde tiers
        if (!isValidEmail) {
          emailError = 'Voer een geldig e-mailadres in';
          isLoading = false;
          return;
        }
        
        // Alles OK - ga naar checkout
        console.log(`💳 Redirecting to checkout for ${tier.id}`);
        const checkoutUrl = `/checkout?tier=${tier.id}&url=${encodeURIComponent(formatUrl(scanUrl))}&email=${encodeURIComponent(email)}`;
        goto(checkoutUrl);
      }
    } catch (error) {
      console.error('Error handling tier click:', error);
      urlError = 'Er ging iets mis. Probeer het opnieuw.';
    } finally {
      setTimeout(() => {
        isLoading = false;
      }, 1000);
    }
  }
  
  // Tier configuration - REORDERED: paid tiers first, basic last
  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: 19.95,
      priceText: '€19,95',
      description: 'Ideaal voor kleine bedrijven en freelancers',
      features: [
        'Alle Basic-functies',
        'AI-gegenereerd content rapport',
        'Downloadbare PDF-rapporten',
        'E-mail ondersteuning'
      ],
      ctaText: 'Koop nu',
      ctaClass: 'bg-blue-600 hover:bg-blue-500',
      checkColor: 'text-blue-500',
      borderClass: 'border-gray-200 hover:border-blue-300',
      isPaid: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 49.95,
      priceText: '€49,95',
      description: 'Voor MKB en marketing professionals',
      features: [
        'Alle Starter-functies',
        'AI-auteur voor content verbetering',
        'Volledig narratief PDF-rapport',
        'Analyse van de versheid van content'
      ],
      ctaText: 'Populairste Keuze',
      ctaClass: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500',
      checkColor: 'text-blue-500',
      borderClass: 'border-2 border-blue-600 shadow-lg shadow-blue-100',
      isPaid: true,
      isPopular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149.95,
      priceText: '€149,95',
      description: 'Voor bureaus en grote ondernemingen',
      features: [
        'Alle Business-functies',
        'Multi-pagina scan & analyse',
        'Concurrentie-analyse',
        'Strategische roadmap'
      ],
      ctaText: 'Neem contact op',
      ctaClass: 'bg-gray-600 hover:bg-gray-500',
      checkColor: 'text-gray-500',
      borderClass: 'border-gray-200 hover:border-gray-300',
      isPaid: true
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      priceText: 'Gratis',
      description: 'Probeer eerst gratis - essentiële technische SEO analyse',
      features: [
        'Technische SEO scan',
        'Schema markup controle',
        'Online resultaten',
        'Geen registratie vereist'
      ],
      ctaText: 'Start Gratis Scan',
      ctaClass: 'bg-green-600 hover:bg-green-500',
      checkColor: 'text-green-500',
      borderClass: 'border-green-200 hover:border-green-300',
      isPaid: false,
      isBasic: true
    }
  ];
</script>

<section id="pricing" class="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-header font-bold text-gray-900 mb-4">
        Kies je scan pakket
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Van professionele AI-analyse tot gratis basis check
      </p>
    </div>

    <!-- URL Input met moderne styling en validatie -->
    <div class="max-w-2xl mx-auto mb-12">
      <div class="relative">
        <input
          type="url"
          bind:value={scanUrl}
          placeholder="bijv. mijnwebsite.nl of https://mijnwebsite.nl"
          class="w-full px-4 py-4 text-base border rounded-xl transition-all duration-300
                 {urlError ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                 focus:ring-2 focus:border-transparent shadow-sm hover:shadow-md"
        />
        <div class="absolute inset-y-0 right-0 flex items-center pr-3">
          {#if isValidUrl}
            <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          {/if}
        </div>
      </div>
      {#if urlError}
        <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          {urlError}
        </p>
      {/if}
    </div>

    <!-- Email Input (conditional voor betaalde tiers) -->
    {#if showEmailInput && selectedTier}
      <div class="max-w-2xl mx-auto mb-12 animate-fade-in">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
          <p class="text-blue-800 text-sm text-center flex items-center justify-center gap-2">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <strong>Gekozen: {tiers.find(t => t.id === selectedTier)?.name}</strong> 
            voor <strong>{tiers.find(t => t.id === selectedTier)?.priceText}</strong>
          </p>
        </div>
        <div class="relative">
          <input
            type="email"
            bind:value={email}
            placeholder="Voer je e-mailadres in voor het rapport..."
            class="w-full px-4 py-4 text-base border rounded-xl transition-all duration-300
                   {emailError ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
                   focus:ring-2 focus:border-transparent shadow-sm hover:shadow-md"
          />
          <div class="absolute inset-y-0 right-0 flex items-center pr-3">
            {#if isValidEmail}
              <svg class="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            {/if}
          </div>
        </div>
        {#if emailError}
          <p class="text-red-500 text-sm mt-2 flex items-center gap-1">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {emailError}
          </p>
        {/if}
      </div>
    {/if}

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
      {#each tiers as tier}
        <div class="group rounded-2xl {tier.borderClass} bg-white p-6 relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                    {tier.isPopular ? 'shadow-xl shadow-blue-100' : 'shadow-sm'}
                    {tier.isBasic ? 'order-last lg:order-none' : ''}">
          
          {#if tier.isPopular}
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md">
                ✨ Populair
              </span>
            </div>
          {/if}
          
          {#if tier.isBasic}
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1 rounded-full text-xs font-medium shadow-md">
                🆓 Gratis Proef
              </span>
            </div>
          {/if}
          
          <div class="text-center">
            <h3 class="text-lg font-semibold leading-8 {tier.isPopular ? 'text-blue-600' : tier.isBasic ? 'text-green-600' : 'text-gray-900'}">
              {tier.name}
            </h3>
            <p class="mt-2 text-sm text-gray-500">{tier.description}</p>
            <div class="mt-4 flex items-baseline justify-center gap-x-2">
              <span class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {tier.priceText}
              </span>
              {#if tier.isPaid}
                <span class="text-sm font-medium text-gray-500">/ eenmalig</span>
              {/if}
            </div>
            
            <ul role="list" class="mt-6 space-y-3">
              {#each tier.features as feature}
                <li class="flex items-start space-x-3">
                  <svg class="h-5 w-5 flex-shrink-0 {tier.checkColor} mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span class="text-sm text-gray-700 text-left">{feature}</span>
                </li>
              {/each}
            </ul>
          </div>
          
          <button
            on:click={() => handleTierClick(tier)}
            disabled={isLoading}
            class="mt-8 block w-full rounded-xl {tier.ctaClass} px-4 py-3 text-center text-sm font-semibold text-white shadow-sm 
                   transition-all duration-200 hover:shadow-lg transform hover:scale-105
                   disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {#if isLoading}
              <span class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                {tier.id === 'basic' ? 'Scan wordt gestart...' : 'Verwerken...'}
              </span>
            {:else if tier.id === 'basic'}
              {!scanUrl ? 'Voer URL in voor gratis scan' : 'Start Gratis Scan'}
            {:else if showEmailInput && selectedTier === tier.id}
              {!email ? 'Voer e-mailadres in' : `Betaal ${tier.priceText}`}
            {:else}
              {tier.ctaText}
            {/if}
          </button>
        </div>
      {/each}
    </div>

    <!-- Extra motivatie voor gratis scan -->
    <div class="mt-12 text-center">
      <p class="text-sm text-gray-600">
        💡 <strong>Tip:</strong> Start met de gratis scan om je website te analyseren, upgrade daarna voor diepere inzichten
      </p>
    </div>
  </div>
</section>

<style>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>