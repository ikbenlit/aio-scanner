<!-- src/lib/components/core/URLInput.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    
    // Props
    export let value = '';
    export let placeholder = 'https://jouwwebsite.nl';
    export let buttonText = 'Scan Nu';
    export let size: 'default' | 'large' = 'default';
    export let disabled = false;
    export let loading = false;
    
    // Events
    const dispatch = createEventDispatcher<{
      scan: { url: string };
      input: { url: string };
    }>();
    
    // Validation
    let isValid = false;
    let error = '';
    
    $: validateUrl(value);
    
    function validateUrl(url: string) {
      error = '';
      
      if (!url) {
        isValid = false;
        return;
      }
      
      try {
        const urlObj = new URL(url);
        isValid = urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        
        if (!isValid) {
          error = 'URL moet beginnen met http:// of https://';
        }
      } catch {
        // Try adding https:// if missing
        if (!url.includes('://')) {
          try {
            new URL('https://' + url);
            isValid = true;
          } catch {
            isValid = false;
            error = 'Voer een geldige URL in';
          }
        } else {
          isValid = false;
          error = 'Voer een geldige URL in';
        }
      }
    }
    
    function handleScan() {
      if (!isValid || disabled || loading) return;
      
      let finalUrl = value;
      
      // Auto-add https:// if missing
      if (!finalUrl.includes('://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      dispatch('scan', { url: finalUrl });
    }
    
    function handleInput() {
      dispatch('input', { url: value });
    }
    
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Enter') {
        handleScan();
      }
    }
    
    // Dynamic sizing
    $: containerClass = size === 'large' 
      ? 'flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-lg border border-gray-200'
      : 'flex flex-col sm:flex-row gap-3 p-1.5 bg-white rounded-xl shadow border border-gray-200';
      
    $: inputClass = size === 'large'
      ? 'w-full h-14 px-6 text-lg border-0 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-blue focus:outline-none transition-all duration-200 font-body'
      : 'w-full h-12 px-4 text-base border-0 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-blue focus:outline-none transition-all duration-200 font-body';
      
    $: buttonClass = size === 'large'
      ? 'h-14 px-8 text-lg font-semibold bg-primary-blue hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all duration-200 whitespace-nowrap'
      : 'h-12 px-6 text-base font-semibold bg-primary-blue hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200 whitespace-nowrap';
  </script>
  
  <div class="w-full">
    <!-- Input Container -->
    <div class={containerClass}>
      <div class="flex-1">
        <input
          bind:value
          on:input={handleInput}
          on:keydown={handleKeydown}
          type="url"
          {placeholder}
          {disabled}
          class={inputClass}
          class:ring-red-500={error}
          class:ring-2={error}
        />
      </div>
      
      <Button
        on:click={handleScan}
        disabled={!isValid || disabled || loading}
        class={buttonClass}
      >
        {#if loading}
          <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Scannen...
        {:else}
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          {buttonText}
        {/if}
      </Button>
    </div>
    
    <!-- Error Message -->
    {#if error}
      <div class="mt-2 text-sm text-red-600 flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        {error}
      </div>
    {/if}
    
    <!-- Optional help text slot -->
    <slot name="help" />
  </div>