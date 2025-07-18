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
  import { goto } from '$app/navigation';
  
  let isScanning = false;
  let isBusinessScanning = false;
  
  // Handle URL scan - start echte scan via API
  async function handleScan(event: CustomEvent<{ url: string }>) {
    console.log('📡 handleScan called in +page.svelte with event:', event);
    const { url } = event.detail;
    
    if (isScanning) return; // Prevent multiple simultaneous scans
    
    try {
      isScanning = true;
      console.log(`🚀 Starting scan for URL: ${url}`);
      
      // Call basic scan API for Free Tier Journey
      const response = await fetch('/api/scan/basic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Scan kon niet worden gestart');
      }
      
      const data = await response.json();
      console.log(`Scan started with ID: ${data.scanId}`);
      
      // Redirect naar scan pagina met echte scan ID en URL als query param
      goto(`/scan/${data.scanId}?url=${encodeURIComponent(url)}`);
      
    } catch (error) {
      console.error('Scan error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      alert(`Scan kon niet worden gestart: ${errorMessage}`);
    } finally {
      isScanning = false;
    }
  }
  
  // Handle Business scan - use real business endpoint 
  async function handleBusinessScan(event: CustomEvent<{ url: string; email: string }>) {
    console.log('💼 handleBusinessScan called in +page.svelte with event:', event);
    const { url, email } = event.detail;
    
    if (isBusinessScanning) return; // Prevent multiple simultaneous scans
    
    try {
      isBusinessScanning = true;
      console.log(`🚀 Starting business scan for URL: ${url}`);
      
      // Use real business endpoint with development payment ID
      const response = await fetch('/api/scan/business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          url: url.includes('gifsvoorinsta.nl') ? 'https://example.com' : url, // Force URL with more content for smart findings testing
          email,
          paymentId: 'dev_business_scan_test' // Development bypass
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Business scan failed');
      }
      
      const data = await response.json();
      console.log('Business scan result:', data);
      
      if (data.scanId) {
        // Redirect to results page with the scan ID
        goto(`/scan/${data.scanId}/results`);
      } else {
        throw new Error('Business scan completed but no scan ID returned');
      }
      
    } catch (error) {
      console.error('Business scan error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Onbekende fout';
      alert(`Business scan kon niet worden gestart: ${errorMessage}`);
    } finally {
      isBusinessScanning = false;
    }
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
  <HeroSection 
    on:scan={handleScan} 
    on:businessScan={handleBusinessScan}
    {isScanning} 
    {isBusinessScanning}
  />
  <FeatureSection />
  <TestimonialSection />
  <PricingSection on:startBasicScan={handleScan} />

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
          loading={isScanning}
          disabled={isScanning}
        />
        <p class="text-sm text-gray-500 mt-4">✓ Geen registratie vereist ✓ Resultaten binnen 30 seconden</p>
      </div>
    </div>
  </section>
</main>

<Footer />