<!-- EmailVerification.svelte -->
<script lang="ts">
  import { Badge } from "$lib/components/ui/badge";
  
  export let email: string;
  export let onVerified: (isValid: boolean) => void;
  
  let isVerifying = false;
  let isValid = false;
  let message = "";

  $: if (email) {
    verifyEmail(email);
  }

  async function verifyEmail(email: string) {
    if (!email) return;
    
    isVerifying = true;
    try {
      const response = await fetch('/api/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      isValid = data.valid;
      message = data.error || "";
      onVerified(isValid);
      
    } catch (error) {
      isValid = false;
      message = "Verificatie mislukt";
    } finally {
      isVerifying = false;
    }
  }
</script>

{#if email}
  <div class="flex items-center gap-2 mt-1">
    {#if isVerifying}
      <Badge variant="outline">Controleren...</Badge>
    {:else if isValid}
      <Badge variant="success" class="flex items-center gap-1">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        Geldig email adres
      </Badge>
    {:else if message}
      <Badge variant="destructive" class="flex items-center gap-1">
        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        {message}
      </Badge>
    {/if}
  </div>
{/if} 