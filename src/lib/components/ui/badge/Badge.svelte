<script lang="ts">
  let className = '';
  export { className as class };
  export let variant: 'default' | 'success' | 'destructive' = 'default';
</script>

<div
  class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 {
    variant === 'success' 
      ? 'border-green-500/50 bg-green-50 text-green-600'
      : variant === 'destructive'
      ? 'border-red-500/50 bg-red-50 text-red-600'
      : 'border-gray-200 bg-white text-gray-900'
  } {className}"
  {...$$restProps}
>
  <slot />
</div> 