<!-- src/lib/components/features/scan/ProgressCircle.svelte -->
<script lang="ts">
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';
  
    export let progress: number = 0; // 0-100
    export let size = 120;
    export let strokeWidth = 8;
    export let color = 'var(--primary-blue)';
    export let bgColor = 'var(--border-gray)';
  
    const animated = tweened(0, { duration: 400, easing: cubicOut });
    $: animated.set(Math.min(Math.max(progress, 0), 100));
  
    $: radius = (size - strokeWidth) / 2;
    $: circumference = 2 * Math.PI * radius;
    $: dashoffset = circumference - (circumference * $animated) / 100;
  </script>
  
  <div class="relative" style="width:{size}px;height:{size}px">
    <svg class="w-full h-full" style="transform: rotate(-90deg);">
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        fill="none"
        stroke={bgColor}
        stroke-width={strokeWidth}
      />
      <circle
        cx={size/2}
        cy={size/2}
        r={radius}
        fill="none"
        stroke={color}
        stroke-width={strokeWidth}
        stroke-linecap="round"
        stroke-dasharray={circumference}
        stroke-dashoffset={dashoffset}
      />
    </svg>
    <div class="absolute inset-0 flex items-center justify-center font-header text-xl text-gray-900">
      {Math.round($animated)}%
    </div>
  </div>