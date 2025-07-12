<!-- src/lib/components/layout/Header.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from '$lib/components/ui/button';
    
    // Props
    export let currentPath = '/';
    export let isAuthenticated = false;
    export let userCredits = 0;
    
    // Events
    const dispatch = createEventDispatcher<{
      login: void;
      upgrade: void;
      dashboard: void;
      logout: void;
    }>();
    
    // Mobile menu state
    let mobileMenuOpen = false;
    
    // Navigation items
    const navItems = [
      { href: '#features', label: 'Features' },
      { href: '#pricing', label: 'Prijzen' },
      { href: '/crawl/start', label: 'Site-wide Scan', isBusinessTier: true },
      { href: '/blog', label: 'Blog' }
    ];
    
    function handleLogin() {
      dispatch('login');
    }
    
    function handleUpgrade() {
      dispatch('upgrade');
    }
    
    function handleDashboard() {
      dispatch('dashboard');
    }
    
    function handleLogout() {
      dispatch('logout');
    }
    
    function toggleMobileMenu() {
      mobileMenuOpen = !mobileMenuOpen;
    }
    
    function closeMobileMenu() {
      mobileMenuOpen = false;
    }
    
    // Close mobile menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element;
      if (!target.closest('.mobile-menu-container')) {
        mobileMenuOpen = false;
      }
    }
  </script>
  
  <svelte:window on:click={handleClickOutside} />
  
  <header class="sticky top-0 z-50 w-full border-b border-border-gray bg-white/95 backdrop-blur-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-3">
          <a href="/" class="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div class="flex h-8 w-8 items-center justify-center rounded bg-gray-900">
              <div class="grid h-5 w-5 grid-cols-2 gap-0.5">
                <div class="rounded-sm bg-primary-blue"></div>
                <div class="rounded-sm bg-secondary-yellow"></div>
                <div class="rounded-sm bg-red-500"></div>
                <div class="rounded-sm bg-secondary-yellow"></div>
              </div>
            </div>
            <span class="text-xl font-header font-bold">AIO Scanner</span>
          </a>
        </div>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <!-- Nav Links -->
          <div class="flex items-center gap-6">
            {#each navItems as item}
              <a 
                href={item.href} 
                class="text-sm font-medium text-gray hover:text-primary-blue transition-colors"
                class:text-primary-blue={currentPath === item.href}
              >
                {item.label}
              </a>
            {/each}
          </div>
          
          <!-- Auth Section -->
          <div class="flex items-center gap-3">
            {#if isAuthenticated}
              <!-- Authenticated User -->
              <div class="flex items-center gap-3">
                <!-- Credits Display -->
                <div class="flex items-center gap-2 px-3 py-1.5 bg-primary-blue/10 rounded-full border border-primary-blue/20">
                  <svg class="w-4 h-4 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <span class="text-sm font-medium text-primary-blue">{userCredits} credits</span>
                </div>
                
                <!-- Dashboard Button -->
                <Button variant="outline" size="sm" on:click={handleDashboard}>
                  Dashboard
                </Button>
                
                <!-- Upgrade Button (if low credits) -->
                {#if userCredits <= 1}
                  <Button size="sm" on:click={handleUpgrade}>
                    Koop Credits
                  </Button>
                {/if}
                
                <!-- User Menu -->
                <button 
                  class="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  on:click={handleLogout}
                >
                  <div class="w-6 h-6 bg-gradient-to-br from-primary-blue to-secondary-yellow rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-xs">U</span>
                  </div>
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            {:else}
              <!-- Guest User -->
              <Button variant="ghost" size="sm" on:click={handleLogin}>
                Inloggen
              </Button>
              <Button size="sm" on:click={handleUpgrade}>
                Koop Credits
              </Button>
            {/if}
          </div>
        </nav>
        
        <!-- Mobile Menu Button -->
        <div class="md:hidden mobile-menu-container">
          <button
            class="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
            on:click={toggleMobileMenu}
            aria-label="Menu"
          >
            {#if mobileMenuOpen}
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            {:else}
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            {/if}
          </button>
          
          <!-- Mobile Menu Dropdown -->
          {#if mobileMenuOpen}
            <div class="absolute right-4 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 mobile-menu-container">
              <!-- Navigation Links -->
              <div class="px-2 py-2">
                {#each navItems as item}
                  <a 
                    href={item.href}
                    class="block px-3 py-2 text-sm font-medium text-gray hover:text-primary-blue hover:bg-gray-50 rounded-lg transition-colors"
                    on:click={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                {/each}
              </div>
              
              <!-- Divider -->
              <div class="h-px bg-gray-200 my-2"></div>
              
              <!-- Auth Section -->
              <div class="px-2 py-2">
                {#if isAuthenticated}
                  <!-- Credits Display -->
                  <div class="flex items-center justify-between px-3 py-2 mb-2 bg-primary-blue/5 rounded-lg">
                    <span class="text-sm font-medium text-gray-700">Credits</span>
                    <span class="text-sm font-bold text-primary-blue">{userCredits}</span>
                  </div>
                  
                  <button 
                    class="w-full text-left px-3 py-2 text-sm font-medium text-gray hover:text-primary-blue hover:bg-gray-50 rounded-lg transition-colors"
                    on:click={() => { handleDashboard(); closeMobileMenu(); }}
                  >
                    Dashboard
                  </button>
                  
                  {#if userCredits <= 1}
                    <button 
                      class="w-full text-left px-3 py-2 text-sm font-medium text-primary-blue hover:bg-primary-blue/5 rounded-lg transition-colors"
                      on:click={() => { handleUpgrade(); closeMobileMenu(); }}
                    >
                      Koop Credits
                    </button>
                  {/if}
                  
                  <button 
                    class="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    on:click={() => { handleLogout(); closeMobileMenu(); }}
                  >
                    Uitloggen
                  </button>
                {:else}
                  <button 
                    class="w-full text-left px-3 py-2 text-sm font-medium text-gray hover:text-primary-blue hover:bg-gray-50 rounded-lg transition-colors mb-2"
                    on:click={() => { handleLogin(); closeMobileMenu(); }}
                  >
                    Inloggen
                  </button>
                  <button 
                    class="w-full text-left px-3 py-2 text-sm font-medium text-white bg-primary-blue hover:bg-primary-blue/90 rounded-lg transition-colors"
                    on:click={() => { handleUpgrade(); closeMobileMenu(); }}
                  >
                    Koop Credits
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </header>