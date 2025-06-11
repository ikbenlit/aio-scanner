<!-- EmailPreview.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { Card } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Loader2 } from "lucide-svelte";
  
  export let template: string;
  export let data: Record<string, any>;
  
  let isLoading = true;
  let error: string | null = null;
  let html = '';

  onMount(async () => {
    try {
      const response = await fetch('/api/email/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template, data })
      });
      
      const result = await response.json();
      if (!result.html) {
        throw new Error('Geen template preview beschikbaar');
      }
      
      html = result.html;
      
    } catch (e) {
      error = e.message || 'Preview laden mislukt';
    } finally {
      isLoading = false;
    }
  });
</script>

<Card class="p-4">
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold">Email Preview</h3>
      <Button variant="outline" size="sm" on:click={() => window.location.reload()}>
        Vernieuwen
      </Button>
    </div>

    {#if isLoading}
      <div class="flex justify-center p-8">
        <Loader2 class="h-8 w-8 animate-spin" />
      </div>
    {:else if error}
      <div class="text-red-500 text-center p-4">
        {error}
      </div>
    {:else}
      <div class="border rounded-lg p-4 bg-white">
        {@html html}
      </div>
    {/if}
  </div>
</Card> 