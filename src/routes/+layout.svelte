
<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import '../app.css';
</script>

<!-- Hier geef je overal dezelfde achtergrond en body-font mee -->
<div class="min-h-screen bg-bg-primary font-body text-gray flex flex-col">
    <!-- Optioneel: zet hier je header/navigation -->
    <header class="p-4 border-b border-border-gray">
        <h1 class="text-2xl font-header text-primary">AIO-Scanner</h1>
    </header>

    <!-- De page-content -->
    <main class="flex-1">
        <slot />
    </main>

    <!-- Optioneel: vaste footer -->
    <footer class="p-4 text-sm text-center text-gray border-t border-border-gray">
        © 2025 AIO-Scanner. Alle rechten voorbehouden.
    </footer>
</div>
  