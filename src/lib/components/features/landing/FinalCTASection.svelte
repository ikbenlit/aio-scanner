<!-- src/lib/components/features/landing/FinalCTASection.svelte -->
<script lang="ts">
  import URLInput from '$lib/components/core/URLInput.svelte';
  
  export let onScan: (event: CustomEvent<{ url: string }>) => void;
</script>

<section class="py-20 lg:py-32 bg-gradient-to-br from-primary-blue/5 via-cyber-accent/5 to-secondary-yellow/5">
  <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
    <h2 class="text-3xl sm:text-4xl font-header font-bold text-gray-900 mb-6">
      Klaar om je website AI-proof te maken?
    </h2>
    <p class="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
      Start vandaag nog met je gratis scan en ontdek hoe goed jouw website vindbaar is voor AI-systemen.
    </p>
    <div class="max-w-xl mx-auto">
      <URLInput 
        size="large" 
        on:scan={onScan}
        placeholder="https://jouwwebsite.nl"
        buttonText="Scan nu gratis"
      />
      <p class="text-sm text-gray-500 mt-4">✓ Geen registratie vereist ✓ Resultaten binnen 30 seconden</p>
    </div>
  </div>
</section>