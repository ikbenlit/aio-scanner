<script lang="ts">
    import { Button } from '$lib/components/ui/button';
  </script>
  
  <main class="min-h-screen p-8 bg-bg-secondary font-body">
    <!-- Title using primary color and header font -->
    <h1 class="text-5xl font-header text-primary mb-4">Welkom bij AIO-Scanner</h1>
    <h1 class="text-6xl font-header text-cyber-accent">Stijl-test</h1>
    <h1 class="text-6xl font-header text-secondary">Stijl-test</h1>
    <h1 class="text-6xl font-header text-destructive">Stijl-test</h1>
    <h1 class="text-6xl font-header text-success">Stijl-test</h1>
    <h1 class="text-6xl font-header text-gray">Stijl-test</h1>
    <h1 class="text-6xl font-header text-border-gray">Stijl-test</h1>
    <h1 class="text-6xl font-header text-bg-light">Stijl-test</h1>
  
    <!-- Subtitle using accent color -->
    <p class="text-lg text-accent mb-6">Snel, betrouwbaar en inzichtelijk</p>
  
    <!-- Glassmorphic card example -->
    <section class="glass p-6 max-w-md mx-auto shadow-soft mb-8">
      <h2 class="text-2xl font-header text-primary mb-2">Laatste scan resultaat</h2>
      <p class="text-base text-gray mb-4">
        Geen scans gevonden. Voer een URL in en klik op "Scan nu".
      </p>
      <Button>Scan nu</Button>
    </section>
  
    <!-- Footer -->
    <footer class="text-sm text-gray text-center mt-12">
      © 2025 AIO-Scanner. Alle rechten voorbehouden.
    </footer>
  </main>
  