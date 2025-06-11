<!-- EmailCaptureForm.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { EmailInput } from "$lib/components/ui/input";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  
  export let scanId: string;
  export let onSuccess: () => void;
  
  let email = "";
  let isLoading = false;
  let error: string | null = null;
  let success = false;

  async function handleSubmit() {
    if (!email) {
      error = "Email is verplicht";
      return;
    }

    isLoading = true;
    error = null;

    try {
      // Eerst email valideren
      const validateRes = await fetch('/api/email/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const validateData = await validateRes.json();
      if (!validateData.valid) {
        error = validateData.error || "Ongeldig email adres";
        return;
      }

      // Email verzenden
      const sendRes = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, scanId })
      });

      const data = await sendRes.json();
      
      if (!data.success) {
        throw new Error(data.error || "Email verzenden mislukt");
      }

      success = true;
      onSuccess();

    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Er is iets misgegaan";
    } finally {
      isLoading = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-4">
  <div class="space-y-2">
    <EmailInput
      placeholder="jouw@email.nl"
      bind:value={email}
      disabled={isLoading}
      required
    />
    
    {#if error}
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    {/if}
  </div>

  <Button type="submit" disabled={isLoading} class="w-full">
    {#if isLoading}
      <svg class="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 11-6.219-8.56"/>
      </svg>
      Email versturen...
    {:else}
      Bekijk Resultaten
    {/if}
  </Button>

  {#if success}
    <Alert>
      <AlertDescription>
        Je rapport is onderweg naar {email}!
      </AlertDescription>
    </Alert>
  {/if}
</form> 