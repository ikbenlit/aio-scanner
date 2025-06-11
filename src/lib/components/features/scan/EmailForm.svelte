<script lang="ts">
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher<{ submit: string }>();
  
    let email = '';
    let isSubmitting = false;
    let errors: Record<string, string> = {};
  
    function validateEmail(value: string): boolean {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(value);
    }
  
    async function handleSubmit() {
      errors = {};
  
      if (!email) {
        errors.email = 'Email is verplicht';
        return;
      }
  
      if (!validateEmail(email)) {
        errors.email = 'Voer een geldig email adres in';
        return;
      }
  
      isSubmitting = true;
  
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        dispatch('submit', email);
      } catch (err) {
        errors.general = 'Er ging iets mis. Probeer het opnieuw.';
      } finally {
        isSubmitting = false;
      }
    }
  </script>
  
  <form class="email-form" on:submit|preventDefault={handleSubmit}>
    <div class="form-group">
      <label for="email" class="form-label">Email adres</label>
      <input
        type="email"
        id="email"
        bind:value={email}
        class="email-input"
        class:error={errors.email}
        placeholder="jouw.email@bedrijf.nl"
        required
        autocomplete="email"
        disabled={isSubmitting}
      />
      {#if errors.email}
        <div class="error-message">{errors.email}</div>
      {/if}
    </div>
  
    <button type="submit" class="cta-button" disabled={isSubmitting}>
      {#if isSubmitting}
        <svg class="animate-spin" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
        Verwerken...
      {:else}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        Bekijk Mijn Resultaten
      {/if}
    </button>
  
    {#if errors.general}
      <div class="error-message general-error">{errors.general}</div>
    {/if}
  </form>
  
  <style>
    .email-form {
      margin-bottom: 2rem;
    }
  
    .email-input {
      width: 100%;
      height: 3.5rem;
      padding: 0 1.25rem;
      border: 2px solid var(--border-gray);
      border-radius: 12px;
      font-size: 1rem;
      font-family: inherit;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }
  
    .email-input:focus {
      outline: none;
      border-color: var(--primary-blue);
      background: rgba(255, 255, 255, 0.95);
      box-shadow: 0 0 0 3px rgba(46, 155, 218, 0.1);
    }
  
    .email-input.error {
      border-color: var(--accent-red);
    }
  
    .cta-button {
      width: 100%;
      height: 3.5rem;
      background: var(--primary-gradient);
      color: white;
      border: none;
      border-radius: 12px;
      font-family: var(--font-body);
      font-size: 1.125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }
  
    .cta-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px 0 rgba(46, 155, 218, 0.5);
    }
  
    .cta-button:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  
    .error-message {
      color: var(--accent-red);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
  
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  </style>