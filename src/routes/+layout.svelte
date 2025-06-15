<!-- src/routes/+layout.svelte -->
<script lang="ts">
    import '/src/app.css';
    import Header from '$lib/components/layout/Header.svelte';
    import Footer from '$lib/components/layout/Footer.svelte';
</script>

<!-- Hier geef je overal dezelfde achtergrond en body-font mee -->
<div class="min-h-screen bg-bg-light font-body text-gray flex flex-col">

    <!-- De page-content -->
    <main class="flex-1">
        <slot />
    </main>

</div>
  