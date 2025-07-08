<!-- src/lib/components/features/scan/ScoreHero.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { getScoreInterpretation, getScoreContext, getScoreColorClasses } from '$lib/results/interpretation';
  import type { ScoreInterpretation } from '$lib/results/interpretation';

  export let score: number;
  export let url: string;
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
</script>

<div class="bg-white rounded-xl p-8 shadow-sm border border-gray-100">
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

  <!-- Website URL (if provided) -->
  {#if url}
    <div class="mt-6 pt-6 border-t border-gray-100">
      <div class="text-sm text-gray-500 mb-1">Gescande website:</div>
      <div class="text-gray-700 font-medium break-all">
        {url}
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