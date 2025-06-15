<!-- EmailCaptureModal.svelte -->
<script lang="ts">
  import { fade, blur } from 'svelte/transition';
  import { goto } from '$app/navigation';
  import { Button } from "$lib/components/ui/button";
  import EmailCaptureForm from './EmailCaptureForm.svelte';
  import WebsitePreview from '../scan/WebsitePreview.svelte';
  
  export let scanId: string;
  export let url: string;
  export let isOpen: boolean;
  export let onSuccess: () => void;
  export let onClose: () => void;
  
  // Trust indicators data
  const trustIndicators = [
    { icon: '🔒', text: 'Veilig & versleuteld' },
    { icon: '✉️', text: 'Geen spam, direct resultaat' },
    { icon: '📊', text: 'Professioneel PDF rapport' }
  ];

  async function handleSuccess() {
    // Eerst modal sluiten
    isOpen = false;
    // Dan redirecten
    await goto(`/scan/${scanId}/results`);
    // Dan callback aanroepen
    onSuccess();
  }
</script>

{#if isOpen}
  <!-- Background overlay met blur effect -->
  <div
    class="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    transition:fade
    on:click={() => onClose()}
    on:keydown={(e) => { if (e.key === 'Escape') onClose(); }}
    role="button"
    aria-label="Close modal"
  >
    <!-- Glassmorphism modal -->
    <div
      class="bg-white/90 backdrop-blur-md rounded-xl shadow-xl max-w-lg w-full mx-auto overflow-hidden"
      transition:blur
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
    >
      <!-- Website preview -->
      <div class="border-b">
        <WebsitePreview websiteUrl={url} />
      </div>

      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-2xl font-bold">Bekijk je volledige rapport</h2>
          <p class="text-gray-600 mt-2">
            Vul je email in om direct toegang te krijgen tot je volledige scan rapport.
          </p>
        </div>

        <!-- Email capture form -->
        <EmailCaptureForm {scanId} onSuccess={handleSuccess} />

        <!-- Trust indicators -->
        <div class="border-t pt-4 mt-6">
          <p class="text-sm text-gray-500 mb-3">Waarom je ons kunt vertrouwen:</p>
          <div class="grid grid-cols-1 gap-3">
            {#each trustIndicators as indicator}
              <div class="flex items-center gap-2 text-sm text-gray-600">
                <span class="text-lg">{indicator.icon}</span>
                <span>{indicator.text}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
{/if} 