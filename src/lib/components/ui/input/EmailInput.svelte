<script lang="ts">
  let className = '';
  export { className as class };
  export let value = '';
  export let placeholder = '';
  export let disabled = false;
</script>

<input
  type="email"
  {placeholder}
  {disabled}
  bind:value
  class="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {className}"
  on:blur
  on:focus
  on:input
  on:keydown
  {...$$restProps}
/> 