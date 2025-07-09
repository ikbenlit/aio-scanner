<!-- src/lib/components/features/landing/PricingSection.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { goto } from '$app/navigation';
  
  const dispatch = createEventDispatcher();
  
  let scanUrl = '';
  let email = '';
  let isValidEmail = false;
  let showEmailInput = false;
  let selectedTier = null;
  
  // Tier configuration
  const tiers = [
    {
      id: 'basic',
      name: 'Basic',
      price: 0,
      priceText: 'Gratis',
      description: 'Essentiële technische SEO analyse',
      features: [
        'Technische SEO scan',
        'Schema markup controle',
        'Online resultaten',
        'Geen registratie vereist'
      ],
      ctaText: 'Start Gratis Scan',
      ctaClass: 'bg-green-600 hover:bg-green-500',
      checkColor: 'text-green-500',
      borderClass: 'border-gray-200',
      isPaid: false
    },
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
      borderClass: 'border-gray-200',
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
      ctaClass: 'bg-blue-600 hover:bg-blue-500',
      checkColor: 'text-blue-500',
      borderClass: 'border-2 border-blue-600',
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
      borderClass: 'border-gray-200',
      isPaid: true
    }
  ];
  
  // Email validation
  $: isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  function handleTierClick(tier) {
    if (tier.id === 'basic') {
      // Dispatch event for free scan
      dispatch('startBasicScan', { url: scanUrl });
    } else {
      // For paid tiers, show email input or redirect to checkout
      if (showEmailInput && selectedTier === tier.id && isValidEmail && scanUrl) {
        // Redirect to checkout
        const checkoutUrl = `/checkout?tier=${tier.id}&url=${encodeURIComponent(scanUrl)}&email=${encodeURIComponent(email)}`;
        goto(checkoutUrl);
      } else {
        // Show email input for this tier
        selectedTier = tier.id;
        showEmailInput = true;
      }
    }
  }
</script>

<section class="py-20 bg-gradient-to-br from-bg-light via-white to-blue-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-header font-bold text-gray-900 mb-4">
        Kies je scan pakket
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Van gratis basis analyse tot volledige enterprise SEO-audit
      </p>
    </div>

    <!-- URL Input -->
    <div class="max-w-2xl mx-auto mb-12">
      <div class="flex gap-2">
        <input
          type="url"
          bind:value={scanUrl}
          placeholder="Voer je website URL in..."
          class="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <!-- Email Input (conditional) -->
    {#if showEmailInput}
      <div class="max-w-2xl mx-auto mb-12">
        <div class="flex gap-2">
          <input
            type="email"
            bind:value={email}
            placeholder="Voer je e-mailadres in..."
            class="flex-1 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <p class="text-sm text-gray-500 mt-2 text-center">
          E-mailadres is verplicht voor betaalde scans
        </p>
      </div>
    {/if}

    <div class="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
      <!-- Dynamic Tier Cards -->
      {#each tiers as tier}
        <div class="rounded-2xl {tier.borderClass} bg-white p-6 {tier.isPopular ? 'shadow-lg' : 'shadow-sm'} relative">
          {#if tier.isPopular}
            <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span class="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                Populair
              </span>
            </div>
          {/if}
          
          <div class="text-center">
            <h3 class="text-lg font-semibold leading-8 {tier.isPopular ? 'text-blue-600' : 'text-gray-900'}">
              {tier.name}
            </h3>
            <p class="mt-2 text-sm text-gray-500">{tier.description}</p>
            <div class="mt-4 flex items-center justify-center gap-x-2">
              <span class="text-3xl font-bold text-gray-900">{tier.priceText}</span>
              {#if tier.isPaid}
                <span class="text-sm font-medium text-gray-500">/ eenmalig</span>
              {/if}
            </div>
            
            <ul role="list" class="mt-6 space-y-4">
              {#each tier.features as feature}
                <li class="flex space-x-3">
                  <svg class="h-6 w-6 flex-shrink-0 {tier.checkColor}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span class="text-sm text-gray-700">{feature}</span>
                </li>
              {/each}
            </ul>
          </div>
          
          <button
            on:click={() => handleTierClick(tier)}
            disabled={tier.isPaid && (!scanUrl || (showEmailInput && selectedTier === tier.id && !isValidEmail))}
            class="mt-8 block w-full rounded-md {tier.ctaClass} px-3 py-2 text-center text-sm font-semibold text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {tier.ctaText}
          </button>
        </div>
      {/each}
    </div>
  </div>
</section>