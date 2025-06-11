<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    export let isOpen = false;
    export let zIndex = 50;
  
    const dispatch = createEventDispatcher<{ close: void }>();
  
    function handleClose() {
      dispatch('close');
    }
  </script>
  
  {#if isOpen}
    <div
      class="aio-overlay fixed inset-0 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-center p-4"
      style:z-index={zIndex}
      on:click|self={handleClose}
      role="presentation"
    >
      <slot />
    </div>
  {/if}
  
  <style>
    :global(body:has(.aio-overlay)) {
      overflow: hidden;
    }
  </style>