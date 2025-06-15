<script lang="ts">
  let className = '';
  export { className as class };
</script>

<div class="text-sm [&_p]:leading-relaxed {className}" {...$$restProps}>
  <slot />
</div> 