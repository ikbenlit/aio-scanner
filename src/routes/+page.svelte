<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Button } from '$lib/components/ui/button';
  import URLInput from '$lib/components/core/URLInput.svelte';
  import HeroSection from '$lib/components/features/landing/HeroSection.svelte';
  import FeatureSection from '$lib/components/features/landing/FeatureSection.svelte';
  import PricingSection from '$lib/components/features/landing/PricingSection.svelte';
  import TestimonialSection from '$lib/components/features/landing/TestimonialSection.svelte';
  import Header from '$lib/components/layout/Header.svelte';
  import Footer from '$lib/components/layout/Footer.svelte';
  
  // Handle URL scan
  function handleScan(event: CustomEvent<{ url: string }>) {
    const { url } = event.detail;
    // TODO: Navigate to scan page
    console.log('Starting scan for:', url);
    // goto(`/scan?url=${encodeURIComponent(url)}`);
  }
  
  function handleLogin() {
    // TODO: Navigate to auth page
    console.log('Navigate to login');
  }
  
  function handleDirectPurchase() {
    // TODO: Navigate to upgrade page
    console.log('Navigate to upgrade');
  }
</script>

<svelte:head>
  <title>AIO Scanner - Is jouw website LLM-proof?</title>
  <meta name="description" content="De eerste AI-gereedheid scanner voor websites. Optimaliseer je content voor de toekomst van zoeken." />
</svelte:head>

<Header />

<main>
  <HeroSection onScan={handleScan} />
  <FeatureSection />
  <TestimonialSection />
  <PricingSection onScan={handleScan} />

  <!-- Final CTA -->
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
          on:scan={handleScan}
          placeholder="https://jouwwebsite.nl"
          buttonText="Scan nu gratis"
        />
        <p class="text-sm text-gray-500 mt-4">✓ Geen registratie vereist ✓ Resultaten binnen 30 seconden</p>
      </div>
    </div>
  </section>
</main>

<Footer />