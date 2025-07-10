<!-- src/lib/components/features/scan/ScanHeader.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getScoreInterpretation, getScoreContext, getScoreColorClasses } from '$lib/results/interpretation';
  import type { ScoreInterpretation } from '$lib/results/interpretation';

  export let score: number;
  export let url: string;
  export let pageTitle: string | null = null;
  export let tier: string = 'basic';
  export let scanDate: string | null = null;
  export let keyInsights: {
    conversational: { score: number; benchmark: string } | null;
    authority: { score: number; details: string[] } | null;
  } | null = null;
  export let showContext: boolean = true;

  let displayScore = 0;
  let interpretation: ScoreInterpretation;
  let colorClasses: ReturnType<typeof getScoreColorClasses>;
  let mounted = false;

  $: {
    interpretation = getScoreInterpretation(score);
    colorClasses = getScoreColorClasses(score);
  }

  // Animate score from 0 to final value
  onMount(() => {
    mounted = true;
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = score / steps;
    let currentStep = 0;
    
    const interval = setInterval(() => {
      currentStep++;
      displayScore = Math.min(Math.round(currentStep * increment), score);
      
      if (currentStep >= steps) {
        clearInterval(interval);
        displayScore = score;
      }
    }, duration / steps);
  });

  // Calculate stroke-dashoffset for progress circle
  $: circumference = 2 * Math.PI * 90; // radius = 90
  $: strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Format scan date
  function formatScanDate(dateStr: string | null): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('nl-NL', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return '';
    }
  }

  // Format tier display name
  function formatTierName(tierName: string): string {
    switch (tierName.toLowerCase()) {
      case 'basic': return 'Basic';
      case 'starter': return 'Starter';
      case 'business': return 'Business';
      case 'enterprise': return 'Enterprise';
      default: return tierName;
    }
  }
</script>

<div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
  <!-- Enhanced Header Section -->
  <div class="mb-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
      <div class="flex-1">
        <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          {#if pageTitle}
            Analyse van "{pageTitle}"
          {:else}
            Website Analyse
          {/if}
        </h1>
        <div class="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
          <span class="font-medium">{url}</span>
          <span class="hidden sm:inline">|</span>
          <span>Score: {displayScore}/100</span>
        </div>
      </div>
      <div class="mt-4 md:mt-0 text-right">
        <div class="text-sm text-gray-500">
          {#if scanDate}
            Datum scan: {formatScanDate(scanDate)}
          {/if}
        </div>
        <div class="text-sm font-medium text-gray-700">
          Pakket: {formatTierName(tier)}
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Layout -->
  <div class="block md:hidden text-center">
    <!-- Score Circle -->
    <div class="relative inline-block mb-6">
      <svg class="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
        <!-- Background circle -->
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          stroke-width="8"
          fill="none"
          class="text-gray-200"
        />
        <!-- Progress circle -->
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          class="{colorClasses.circleColor} transition-all duration-1000 ease-out"
          stroke-dasharray={circumference}
          stroke-dashoffset={mounted ? strokeDashoffset : circumference}
        />
      </svg>
      
      <!-- Score text inside circle -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div class="text-4xl font-bold {colorClasses.textColor}">
            {displayScore}
          </div>
          <div class="text-lg text-gray-500 font-medium">
            100
          </div>
        </div>
      </div>
    </div>

    <!-- Score interpretation -->
    <div class="mb-4">
      <div class="flex items-center justify-center gap-2 mb-2">
        <span class="text-2xl">{interpretation.icon}</span>
        <h2 class="text-xl font-semibold {colorClasses.textColor}">
          Je AI-Gereedheid
        </h2>
      </div>
      <div class="text-lg font-medium {colorClasses.textColor} mb-2">
        {interpretation.level}
      </div>
      <p class="text-gray-600 text-base leading-relaxed">
        {interpretation.message}
      </p>
    </div>

    <!-- Context information -->
    {#if showContext}
      <div class="text-sm text-gray-500 px-4">
        {getScoreContext(score)}
      </div>
    {/if}
  </div>

  <!-- Desktop Layout -->
  <div class="hidden md:flex items-center gap-8">
    <!-- Score Circle -->
    <div class="relative flex-shrink-0">
      <svg class="w-40 h-40 transform -rotate-90" viewBox="0 0 200 200">
        <!-- Background circle -->
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          stroke-width="8"
          fill="none"
          class="text-gray-200"
        />
        <!-- Progress circle -->
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          stroke-width="8"
          fill="none"
          stroke-linecap="round"
          class="{colorClasses.circleColor} transition-all duration-1000 ease-out"
          stroke-dasharray={circumference}
          stroke-dashoffset={mounted ? strokeDashoffset : circumference}
        />
      </svg>
      
      <!-- Score text inside circle -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <div class="text-3xl font-bold {colorClasses.textColor}">
            {displayScore}
          </div>
          <div class="text-base text-gray-500 font-medium">
            100
          </div>
        </div>
      </div>
    </div>

    <!-- Score interpretation -->
    <div class="flex-1">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-3xl">{interpretation.icon}</span>
        <h2 class="text-2xl font-semibold {colorClasses.textColor}">
          Je AI-Gereedheid: {interpretation.level}
        </h2>
      </div>
      
      <p class="text-gray-600 text-lg leading-relaxed mb-3">
        {interpretation.message}
      </p>

      {#if showContext}
        <div class="text-sm text-gray-500">
          {getScoreContext(score)}
        </div>
      {/if}
    </div>
  </div>

  <!-- Key Insights Section (Business+ tiers only) -->
  {#if keyInsights && (tier === 'business' || tier === 'enterprise')}
    <div class="mt-8 pt-6 border-t border-gray-100">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Strategische Kerninzichten</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Conversational Score -->
        {#if keyInsights.conversational}
          <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-blue-900">Conversational Tone</span>
              <span class="text-xl font-bold text-blue-700">
                {keyInsights.conversational.score}/100
              </span>
            </div>
            <div class="text-xs text-blue-600">
              ({keyInsights.conversational.benchmark})
            </div>
          </div>
        {/if}

        <!-- Authority Score -->
        {#if keyInsights.authority}
          <div class="p-4 bg-green-50 rounded-lg border border-green-100">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-medium text-green-900">Website Authority</span>
              <span class="text-xl font-bold text-green-700">
                {keyInsights.authority.score}
              </span>
            </div>
            <div class="text-xs text-green-600">
              {keyInsights.authority.details.join(' | ')}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  /* Ensure smooth animation */
  svg circle {
    transition: stroke-dashoffset 0.3s ease;
  }
</style>