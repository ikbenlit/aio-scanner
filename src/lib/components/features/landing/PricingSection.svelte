<!-- src/lib/components/features/landing/PricingSection.svelte -->
<script lang="ts">
  import URLInput from '$lib/components/core/URLInput.svelte';
  
  export let onScan: (event: CustomEvent<{ url: string }>) => void;
</script>

<section class="py-20 bg-gradient-to-br from-bg-light via-white to-blue-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-header font-bold text-gray-900 mb-4">
        Transparante prijzen
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Kies het plan dat bij jouw behoeften past. Credits verlopen nooit en je betaalt alleen voor wat je gebruikt.
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      <!-- Single Scan -->
      <div class="glass p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div class="text-center mb-8">
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">Losse Scan</h3>
          <div class="text-3xl font-bold text-gray-900">€9,95</div>
          <p class="text-gray-600">voor één scan</p>
        </div>
        
        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            1 scan
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Basis PDF rapport
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            AI-vindbaarheid score
          </li>
        </ul>

        <URLInput 
          size="default"
          on:scan={onScan}
          placeholder="https://jouwwebsite.nl"
          buttonText="Start scan"
        />
      </div>

      <!-- Starter Pack -->
      <div class="glass p-8 rounded-2xl border-2 border-primary-blue relative transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span class="bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-medium">
            Populair
          </span>
        </div>
        
        <div class="text-center mb-8">
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">Starter Pack</h3>
          <div class="text-3xl font-bold text-gray-900">€19,95</div>
          <p class="text-gray-600">voor 2 credits + 1 bonus</p>
        </div>
        
        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            2 credits (verlopen nooit)
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            +1 gratis bonus scan
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Uitgebreid PDF rapport
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Scan historie (30 dagen)
          </li>
        </ul>

        <button class="w-full bg-primary-blue text-white py-2 px-4 rounded-lg hover:bg-primary-blue-dark transition-colors">
          Koop nu
        </button>
      </div>

      <!-- Professional Pack -->
      <div class="glass p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
        <div class="text-center mb-8">
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">Professional Pack</h3>
          <div class="text-3xl font-bold text-gray-900">€49,95</div>
          <p class="text-gray-600">voor 5 credits + 1 bonus</p>
        </div>
        
        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            5 credits (verlopen nooit)
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            +1 gratis bonus scan
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Uitgebreid PDF rapport
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Scan historie (90 dagen)
          </li>
        </ul>

        <button class="w-full bg-primary-blue text-white py-2 px-4 rounded-lg hover:bg-primary-blue-dark transition-colors">
          Koop nu
        </button>
      </div>
    </div>
  </div>
</section>