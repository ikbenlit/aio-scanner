<!-- src/lib/components/features/landing/HeroSection.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import URLInput from '$lib/components/core/URLInput.svelte';
  
  export let isScanning: boolean = false;
  export let isBusinessScanning: boolean = false;
  
  const dispatch = createEventDispatcher<{
    scan: { url: string };
    businessScan: { url: string; email: string };
  }>();
  
  // Business scan state
  let businessEmail = '';
  let businessUrl = '';
  let emailError = '';
  
  function handleScan(event: CustomEvent<{ url: string }>) {
    console.log('HeroSection handleScan called with:', event.detail);
    // Dispatch event up to parent
    dispatch('scan', event.detail);
  }
  
  function handleBusinessScan() {
    // Reset error
    emailError = '';
    
    // Validate URL (email optional for testing)
    if (!businessUrl.trim()) {
      emailError = 'Website URL is verplicht';
      return;
    }
    
    const scanData = { url: businessUrl, email: businessEmail };
    console.log('HeroSection handleBusinessScan called with:', scanData);
    
    // Dispatch event up to parent
    dispatch('businessScan', scanData);
  }
  
  // Animation logic
  onMount(() => {
    // Start animation after component mounts
    setTimeout(startDemoAnimation, 2000);
  });
  
  function startDemoAnimation() {
    // Animate score circle (0 to 86% over 3 seconds)
    const circle = document.querySelector('.animated-circle') as SVGCircleElement;
    const scoreElement = document.querySelector('.animated-score') as HTMLElement;
    const statusElement = document.querySelector('.animated-status') as HTMLElement;
    
    if (!circle || !scoreElement) return;
    
    // Calculate circle animation
    const circumference = 2 * Math.PI * 45; // radius = 45
    const targetScore = 86;
    const targetOffset = circumference - (circumference * targetScore) / 100;
    
    // Animate circle
    circle.style.transition = 'stroke-dashoffset 3s ease-out';
    circle.style.strokeDashoffset = targetOffset.toString();
    
    // Animate score counter
    let currentScore = 0;
    const increment = targetScore / 60; // 60 frames for smooth animation
    
    function updateScore() {
      currentScore += increment;
      if (currentScore < targetScore) {
        scoreElement.textContent = Math.floor(currentScore).toString();
        requestAnimationFrame(updateScore);
      } else {
        scoreElement.textContent = targetScore.toString();
      }
    }
    updateScore();
    
    // Animate modules one by one
    const moduleItems = document.querySelectorAll('.module-item');
    moduleItems.forEach((item, index) => {
      const delay = 500 + (index * 500); // Stagger by 500ms
      setTimeout(() => {
        const dot = item.querySelector('.module-dot') as HTMLElement;
        if (dot) {
          dot.style.backgroundColor = '#10b981'; // success-green
          dot.innerHTML = '<svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 13l4 4L19 7"></path></svg>';
        }
      }, delay);
    });
    
    // Show final status
    setTimeout(() => {
      if (statusElement) {
        statusElement.style.transition = 'opacity 0.5s ease-out';
        statusElement.style.opacity = '1';
      }
    }, 3500);
  }
</script>

<section class="relative overflow-hidden bg-gradient-to-br from-bg-light via-white to-blue-50 py-20 lg:py-32">
  <!-- Background decoration -->
  <div class="absolute inset-0 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239fa6b2%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
  
  <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="grid lg:grid-cols-2 gap-12 items-center">
      <!-- Linkerkant: tekst, input, trust indicators -->
      <div class="lg:text-left text-center flex flex-col justify-center h-full">
        <!-- Badge -->
        <div class="inline-flex items-center rounded-full bg-primary-blue/10 px-4 py-2 text-sm font-medium text-primary-blue ring-1 ring-primary-blue/20 mb-8">
          <span class="mr-2">🚀</span>
          Eerste AI-gereedheid scanner
        </div>
        <!-- Main heading -->
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-header font-bold text-gray-900 mb-6">
          Is jouw website <br class="block lg:hidden" />
          <span class="text-primary-blue">LLM-proof</span>?
        </h1>
        <!-- Subtitle -->
        <p class="mx-auto max-w-2xl text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
          Ontdek hoe goed jouw website vindbaar is voor AI-systemen zoals ChatGPT, Perplexity en Google Gemini. Krijg concrete verbeteringen om voorop te lopen.
        </p>
        <!-- Free Scan Input -->
        <div class="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto lg:mx-0 mb-6">
          <URLInput 
            size="large" 
            on:scan={handleScan}
            placeholder="https://jouwwebsite.nl"
            buttonText="Gratis Scan"
            loading={isScanning}
            disabled={isScanning}
          />
        </div>
        
        <!-- Business Scan Input -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 max-w-xl mx-auto lg:mx-0 mb-4">
          <div class="flex items-center mb-4">
            <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
              PREMIUM
            </div>
            <div class="text-lg font-semibold text-gray-900">Complete AI Analyse</div>
            <div class="ml-auto text-right">
              <div class="text-sm text-gray-500 line-through">€49.95</div>
              <div class="text-lg font-bold text-blue-600">€39.95</div>
            </div>
          </div>
          
          <div class="text-sm text-gray-600 mb-4">
            ✨ Alle 6 AI modules • 📊 Uitgebreid PDF rapport • 🎯 Persoonlijke aanbevelingen
          </div>
          
          <div class="space-y-3">
            <!-- Email Input (Optional for testing) -->
            <div>
              <input
                type="email"
                bind:value={businessEmail}
                placeholder="jouw@email.nl (optioneel voor test)"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                class:border-red-500={emailError}
                disabled={isBusinessScanning}
              />
              {#if emailError}
                <p class="text-red-500 text-sm mt-1">{emailError}</p>
              {/if}
            </div>
            
            <!-- URL Input -->
            <div class="flex gap-2">
              <input
                type="url"
                bind:value={businessUrl}
                placeholder="https://jouwwebsite.nl"
                class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isBusinessScanning}
              />
              <button
                on:click={handleBusinessScan}
                disabled={isBusinessScanning || !businessUrl.trim()}
                class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
              >
                {#if isBusinessScanning}
                  <div class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Scannen...
                  </div>
                {:else}
                  Premium Scan
                {/if}
              </button>
            </div>
          </div>
        </div>
        <!-- Trust Indicators -->
        <div class="flex flex-wrap lg:justify-start justify-center gap-6 text-sm text-gray-600 mt-2">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Gratis basis scan (2 modules)
          </div>
          <div class="flex items-center">
            <svg class="w-5 h-5 text-success-green mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Geen registratie vereist
          </div>
          <div class="flex items-center">
            <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Premium: Alle AI modules
          </div>
        </div>
      </div>
      <!-- Rechterkant: scan animatie -->
      <div class="flex justify-center items-center w-full h-full">
        <div class="glass p-8 max-w-sm w-full">
          <div class="text-center mb-6">
            <div class="text-sm text-gray-600 mb-2">AI Scan</div>
            <div class="text-xs text-primary-blue font-medium">Realtime analyse</div>
          </div>
          <!-- Animated Score Circle -->
          <div class="relative w-64 h-64 mx-auto mb-6">
            <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <!-- Background circle -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="8"
              />
              <!-- Animated progress circle -->
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                stroke-width="8"
                stroke-linecap="round"
                stroke-dasharray="283"
                stroke-dashoffset="283"
                class="animated-circle"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style="stop-color:#2E9BDA;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#00F5FF;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
            <!-- Score Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <div class="text-4xl font-header font-bold text-primary-blue animated-score">0</div>
              <div class="text-xs text-gray-500">van 100</div>
            </div>
          </div>
          <!-- Module Checklist -->
          <div class="space-y-2 mb-6">
            <div class="flex items-center text-xs text-gray-600 module-item" data-delay="500">
              <div class="w-4 h-4 mr-2 flex items-center justify-center">
                <div class="w-2 h-2 bg-gray-300 rounded-full module-dot"></div>
              </div>
              <span>AI Content Analysis</span>
            </div>
            <div class="flex items-center text-xs text-gray-600 module-item" data-delay="1000">
              <div class="w-4 h-4 mr-2 flex items-center justify-center">
                <div class="w-2 h-2 bg-gray-300 rounded-full module-dot"></div>
              </div>
              <span>AI Citation Analysis</span>
            </div>
            <div class="flex items-center text-xs text-gray-600 module-item" data-delay="1500">
              <div class="w-4 h-4 mr-2 flex items-center justify-center">
                <div class="w-2 h-2 bg-gray-300 rounded-full module-dot"></div>
              </div>
              <span>Cross Web Footprint</span>
            </div>
            <div class="flex items-center text-xs text-gray-600 module-item" data-delay="2000">
              <div class="w-4 h-4 mr-2 flex items-center justify-center">
                <div class="w-2 h-2 bg-gray-300 rounded-full module-dot"></div>
              </div>
              <span>+ 5 andere modules</span>
            </div>
          </div>
          <!-- Final Status -->
          <div class="text-center animated-status" style="opacity: 0;">
            <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-green/10 text-success-green border border-success-green/20 mb-2">
              Goed
            </div>
            <div class="text-xs text-gray-600">Scan jouw site voor hetzelfde resultaat!</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>