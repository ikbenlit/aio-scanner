<script lang="ts">
  let className = '';
  export { className as class };
  export let variant: 'default' | 'destructive' = 'default';
</script>

<div
  role="alert"
  class="relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-gray-950 {
    variant === 'destructive' 
      ? 'border-red-500/50 text-red-500 dark:border-red-500 [&>svg]:text-red-500'
      : 'border-gray-200 text-gray-950'
  } {className}"
  {...$$restProps}
>
  <slot />
</div> 