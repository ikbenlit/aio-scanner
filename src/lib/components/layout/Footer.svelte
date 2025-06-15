<!-- src/lib/components/layout/Footer.svelte -->
<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher<{
      subscribe: { email: string };
    }>();
    
    // Newsletter signup
    let email = '';
    let isSubscribing = false;
    let subscribeMessage = '';
    
    // Footer links organization
    const footerSections = [
      {
        title: 'Product',
        links: [
          { label: 'Features', href: '#features' },
          { label: 'Prijzen', href: '#pricing' },
          { label: 'API', href: '/api' },
          { label: 'Changelog', href: '/changelog' }
        ]
      },
      {
        title: 'Bedrijf',
        links: [
          { label: 'Over ons', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/contact' },
          { label: 'Careers', href: '/careers' }
        ]
      },
      {
        title: 'Support',
        links: [
          { label: 'Help Center', href: '/help' },
          { label: 'Privacy', href: '/privacy' },
          { label: 'Voorwaarden', href: '/terms' },
          { label: 'Status', href: '/status' }
        ]
      }
    ];
    
    // Social links
    const socialLinks = [
      {
        name: 'Twitter',
        href: 'https://twitter.com/aioscanner',
        icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84'
      },
      {
        name: 'LinkedIn',
        href: 'https://linkedin.com/company/aioscanner',
        icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'
      },
      {
        name: 'GitHub',
        href: 'https://github.com/aioscanner',
        icon: 'M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z'
      }
    ];
    
    async function handleSubscribe() {
      if (!email || isSubscribing) return;
      
      isSubscribing = true;
      subscribeMessage = '';
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        dispatch('subscribe', { email });
        subscribeMessage = 'Bedankt voor je aanmelding! 🎉';
        email = '';
      } catch (error) {
        subscribeMessage = 'Er ging iets mis. Probeer het opnieuw.';
      } finally {
        isSubscribing = false;
      }
    }
  </script>
  
  <footer class="bg-white border-t border-border-gray">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Main Footer Content -->
      <div class="py-12 lg:py-16">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <!-- Company Info & Newsletter -->
          <div class="lg:col-span-2">
            <!-- Logo -->
            <div class="flex items-center gap-3 mb-6">
              <div class="flex h-8 w-8 items-center justify-center rounded bg-gray-900">
                <div class="grid h-5 w-5 grid-cols-2 gap-0.5">
                  <div class="rounded-sm bg-primary-blue"></div>
                  <div class="rounded-sm bg-secondary-yellow"></div>
                  <div class="rounded-sm bg-red-500"></div>
                  <div class="rounded-sm bg-secondary-yellow"></div>
                </div>
              </div>
              <span class="text-xl font-header font-bold">AIO Scanner</span>
            </div>
            
            <!-- Description -->
            <p class="text-sm text-gray-600 mb-6 max-w-md">
              De eerste AI-gereedheid scanner voor websites. Optimaliseer je content voor de toekomst van zoeken.
            </p>
            
            <!-- Newsletter Signup -->
            <div class="mb-6">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Blijf op de hoogte</h3>
              <div class="flex gap-2">
                <input
                  bind:value={email}
                  type="email"
                  placeholder="jouw@email.nl"
                  class="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue focus:outline-none"
                  disabled={isSubscribing}
                />
                <button
                  on:click={handleSubscribe}
                  disabled={!email || isSubscribing}
                  class="px-4 py-2 text-sm font-medium text-white bg-primary-blue hover:bg-primary-blue/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {isSubscribing ? '...' : 'OK'}
                </button>
              </div>
              {#if subscribeMessage}
                <p class="text-xs mt-2" class:text-success-green={subscribeMessage.includes('Bedankt')} class:text-red-500={!subscribeMessage.includes('Bedankt')}>
                  {subscribeMessage}
                </p>
              {/if}
            </div>
          </div>
          
          <!-- Footer Links -->
          {#each footerSections as section}
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-4">{section.title}</h3>
              <ul class="space-y-3">
                {#each section.links as link}
                  <li>
                    <a 
                      href={link.href} 
                      class="text-sm text-gray-600 hover:text-primary-blue transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                {/each}
              </ul>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Bottom Bar -->
      <div class="border-t border-gray-200 py-6">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4">
          <!-- Copyright -->
          <p class="text-xs text-gray-500">
            © 2025 AIO Scanner. Alle rechten voorbehouden.
          </p>
          
          <!-- Social Links -->
          <div class="flex items-center gap-4">
            {#each socialLinks as social}
              <a
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                class="text-gray-400 hover:text-primary-blue transition-colors"
                aria-label={social.name}
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.icon}></path>
                </svg>
              </a>
            {/each}
          </div>
          
          <!-- Additional Info -->
          <div class="flex items-center gap-4 text-xs text-gray-500">
            <span>🇳🇱 Made in The Netherlands</span>
            <span>•</span>
            <span>💚 GDPR Compliant</span>
          </div>
        </div>
      </div>
    </div>
  </footer>