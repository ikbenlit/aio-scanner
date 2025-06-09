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
        Kies het plan dat bij jouw behoeften past. Alle plannen inclusief onbeperkte scans en gedetailleerde rapporten.
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      <!-- Free Plan -->
      <div class="glass p-8 rounded-2xl">
        <div class="text-center mb-8">
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">Gratis</h3>
          <div class="text-3xl font-bold text-gray-900">€0</div>
          <p class="text-gray-600">voor altijd</p>
        </div>
        
        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            1 scan per dag
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Basis rapport
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
          buttonText="Start gratis scan"
        />
      </div>

      <!-- Pro Plan -->
      <div class="glass p-8 rounded-2xl border-2 border-primary-blue relative">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span class="bg-primary-blue text-white px-4 py-1 rounded-full text-sm font-medium">
            Meest gekozen
          </span>
        </div>
        
        <div class="text-center mb-8">
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">Pro</h3>
          <div class="text-3xl font-bold text-gray-900">€49</div>
          <p class="text-gray-600">per maand</p>
        </div>
        
        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Onbeperkte scans
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Gedetailleerd rapport
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            AI-optimalisatie suggesties
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Prioriteit support
          </li>
        </ul>

        <URLInput 
          size="default"
          on:scan={onScan}
          placeholder="https://jouwwebsite.nl"
          buttonText="Start pro scan"
        />
      </div>

      <!-- Enterprise Plan -->
      <div class="glass p-8 rounded-2xl">
        <div class="text-center mb-8">
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">Enterprise</h3>
          <div class="text-3xl font-bold text-gray-900">Op maat</div>
          <p class="text-gray-600">prijs op aanvraag</p>
        </div>
        
        <ul class="space-y-4 mb-8">
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Alles uit Pro plan
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            API toegang
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Custom integraties
          </li>
          <li class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Dedicated support
          </li>
        </ul>

        <button class="w-full bg-primary-blue text-white py-2 px-4 rounded-lg hover:bg-primary-blue-dark transition-colors">
          Neem contact op
        </button>
      </div>
    </div>
  </div>
</section>