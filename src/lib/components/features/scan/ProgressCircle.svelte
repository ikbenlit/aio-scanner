<!-- src/lib/components/features/scan/ProgressCircle.svelte -->
<script lang="ts">
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  export let progress: number = 0; // 0-100
  export let size = 120;
  export let strokeWidth = 8;
  export let showScore = true;
  export let animated = true;
  export let color: string | undefined = undefined;
  
  // Enhanced animation with longer duration for more impact
  const animatedProgress = tweened(0, { 
    duration: animated ? 1500 : 0, 
    easing: cubicOut 
  });
  
  $: animatedProgress.set(Math.min(Math.max(progress, 0), 100));
  
  $: radius = (size - strokeWidth) / 2;
  $: circumference = 2 * Math.PI * radius;
  $: dashoffset = circumference - (circumference * $animatedProgress) / 100;
  
  // Score color logic gebaseerd op waarde
  $: scoreColor = color || getScoreColor($animatedProgress);
  $: scoreStatus = getScoreStatus($animatedProgress);
  
  function getScoreColor(score: number): string {
    if (score >= 80) return '#10b981'; // success-green
    if (score >= 60) return '#2E9BDA'; // primary-blue  
    if (score >= 40) return '#F5B041'; // secondary-yellow
    return '#E74C3C'; // accent-red
  }
  
  function getScoreStatus(score: number): string {
    if (score >= 80) return 'Uitstekend';
    if (score >= 60) return 'Goed';
    if (score >= 40) return 'Matig';
    return 'Verbeterpunten';
  }
</script>

<div 
  class="progress-circle-container" 
  style="width:{size}px;height:{size}px"
  data-animating={animated}
>
  <svg class="progress-svg" viewBox="0 0 {size} {size}">
    <!-- Gradient definitie -->
    <defs>
      <linearGradient id="progress-gradient-{size}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:{scoreColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:{scoreColor};stop-opacity:0.6" />
      </linearGradient>
      <!-- Glow effect filter -->
      <filter id="glow-{size}">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge> 
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    
    <!-- Background circle -->
    <circle
      cx={size/2}
      cy={size/2}
      r={radius}
      fill="none"
      stroke="#e5e7eb"
      stroke-width={strokeWidth}
      class="background-circle"
    />
    
    <!-- Progress circle met gradient en glow -->
    <circle
      cx={size/2}
      cy={size/2}
      r={radius}
      fill="none"
      stroke="url(#progress-gradient-{size})"
      stroke-width={strokeWidth}
      stroke-linecap="round"
      stroke-dasharray={circumference}
      stroke-dashoffset={dashoffset}
      transform="rotate(-90 {size/2} {size/2})"
      filter="url(#glow-{size})"
      class="progress-circle"
    />
  </svg>
  
  {#if showScore}
    <!-- Score content in center -->
    <div class="score-content">
      <div class="score-value" style="color: {scoreColor}">
        {Math.round($animatedProgress)}
      </div>
      <div class="score-label">van 100</div>
      <div class="score-status" style="color: {scoreColor}">
        {scoreStatus}
      </div>
    </div>
  {/if}
</div>

<style>
  .progress-circle-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .progress-svg {
    width: 100%;
    height: 100%;
  }
  
  .background-circle {
    opacity: 0.2;
  }
  
  .progress-circle {
    transition: stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1),
                stroke 0.3s ease;
    filter: drop-shadow(0 0 8px rgba(46, 155, 218, 0.3));
  }
  
  .score-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
  }
  
  .score-value {
    font-family: var(--font-header, system-ui);
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.25rem;
    transition: color 0.3s ease;
  }
  
  .score-label {
    font-size: clamp(0.7rem, 2vw, 0.875rem);
    color: #6b7280;
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
  
  .score-status {
    font-size: clamp(0.7rem, 2vw, 0.875rem);
    font-weight: 600;
    transition: color 0.3s ease;
  }
  
  /* Responsive breakpoints */
  @media (max-width: 640px) {
    .score-value {
      font-size: 1.5rem;
    }
    
    .score-label,
    .score-status {
      font-size: 0.75rem;
    }
  }
  
  /* Animation states */
  .progress-circle-container[data-animating="true"] .progress-circle {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  @keyframes pulse-glow {
    0%, 100% {
      filter: drop-shadow(0 0 8px rgba(46, 155, 218, 0.3));
    }
    50% {
      filter: drop-shadow(0 0 16px rgba(46, 155, 218, 0.5));
    }
  }
</style>