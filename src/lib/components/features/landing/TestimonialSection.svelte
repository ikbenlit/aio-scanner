<!-- src/lib/components/features/landing/TestimonialSection.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    interface Testimonial {
      quote: string;
      author: {
        name: string;
        title: string;
        company: string;
        avatar?: string;
        initials: string;
      };
      rating: number;
    }
    
    // Expert testimonial
    const testimonial: Testimonial = {
      quote: "AI-optimalisatie is de nieuwe SEO. Websites die nu niet voorbereid zijn op AI-zoekmachines, lopen het risico om onzichtbaar te worden in de komende jaren.",
      author: {
        name: "Dr. Sarah van der Berg",
        title: "AI Research Lead",
        company: "TU Delft",
        initials: "SB"
      },
      rating: 5
    };
    
    let mounted = false;
    
    onMount(() => {
      mounted = true;
    });
  </script>
  
  <section class="py-20 lg:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-16">
        <div class="inline-flex items-center rounded-full bg-primary-blue/10 px-4 py-2 text-sm font-medium text-primary-blue ring-1 ring-primary-blue/20 mb-6">
          Expert Quote
        </div>
        <h2 class="text-3xl sm:text-4xl font-header font-bold text-gray-900">
          Wat experts zeggen
        </h2>
      </div>
  
      <!-- Testimonial Card -->
      <div class="max-w-4xl mx-auto">
        <div class="relative p-8 sm:p-12 bg-gradient-to-br from-primary-blue/5 via-white to-cyber-accent/5 rounded-3xl border border-primary-blue/20 shadow-xl backdrop-blur-sm" class:animate-fade-in={mounted}>
          <!-- Background decoration -->
          <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2740%27%20height%3D%2740%27%20viewBox%3D%270%200%2040%2040%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cg%20fill%3D%27%232E9BDA%27%20fill-opacity%3D%270.03%27%3E%3Cpath%20d%3D%27M20%2020c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10zm10%200c0-5.5-4.5-10-10-10s-10%204.5-10%2010%204.5%2010%2010%2010%2010-4.5%2010-10z%27%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30 rounded-3xl"></div>
          
          <!-- Quote decoration -->
          <div class="absolute top-6 left-8 text-6xl text-primary-blue/20 font-serif leading-none select-none">
            "
          </div>
          
          <div class="relative z-10">
            <!-- Star Rating -->
            <div class="flex justify-center mb-8">
              <div class="flex items-center gap-1">
                {#each Array(testimonial.rating) as _}
                  <svg class="w-6 h-6 text-secondary-yellow fill-current" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                {/each}
              </div>
            </div>
            
            <!-- Quote -->
            <blockquote class="text-center mb-12">
              <p class="text-xl sm:text-2xl lg:text-3xl font-medium text-gray-700 leading-relaxed italic">
                {testimonial.quote}
              </p>
            </blockquote>
            
            <!-- Author -->
            <div class="flex items-center justify-center">
              <div class="flex items-center gap-4">
                <!-- Avatar -->
                <div class="relative">
                  <div class="w-16 h-16 bg-gradient-to-br from-primary-blue to-cyber-accent rounded-full flex items-center justify-center shadow-lg">
                    <span class="text-white font-header font-bold text-lg">
                      {testimonial.author.initials}
                    </span>
                  </div>
                  <!-- Verified badge -->
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-success-green rounded-full flex items-center justify-center border-2 border-white">
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
                
                <!-- Author Info -->
                <div class="text-left">
                  <div class="font-header font-bold text-lg text-gray-900">
                    {testimonial.author.name}
                  </div>
                  <div class="text-primary-blue font-medium">
                    {testimonial.author.title}
                  </div>
                  <div class="text-gray-600 text-sm">
                    {testimonial.author.company}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Credibility badges -->
            <div class="flex flex-wrap justify-center gap-4 mt-8 pt-8 border-t border-gray-200">
              <div class="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200">
                <svg class="w-4 h-4 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700">AI Research Expert</span>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200">
                <svg class="w-4 h-4 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700">TU Delft</span>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-gray-200">
                <svg class="w-4 h-4 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
                <span class="text-sm font-medium text-gray-700">100+ Publicaties</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional social proof -->
      <div class="mt-16 text-center">
        <p class="text-gray-600 mb-8">
          Vertrouwd door experts en ondernemers in heel Nederland
        </p>
        
        <!-- Logo grid placeholder -->
        <div class="flex flex-wrap justify-center items-center gap-8 opacity-60">
          <div class="text-gray-400 font-medium text-sm px-4 py-2 border border-gray-200 rounded-lg">
            TU Delft
          </div>
          <div class="text-gray-400 font-medium text-sm px-4 py-2 border border-gray-200 rounded-lg">
            VU Amsterdam  
          </div>
          <div class="text-gray-400 font-medium text-sm px-4 py-2 border border-gray-200 rounded-lg">
            TNO
          </div>
          <div class="text-gray-400 font-medium text-sm px-4 py-2 border border-gray-200 rounded-lg">
            MKB Nederland
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <style>
    .animate-fade-in {
      animation: fadeInUp 0.8s ease-out;
    }
    
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    /* Subtle hover effect */
    .relative:hover .absolute {
      transform: scale(1.02);
      transition: transform 0.3s ease;
    }
  </style>