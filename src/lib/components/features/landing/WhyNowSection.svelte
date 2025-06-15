<!-- src/lib/components/features/landing/WhyNowSection.svelte -->
<script lang="ts">
  // Types
  type BadgeColor = 'blue' | 'yellow' | 'red';
  type IconName = 'lightning' | 'shield' | 'target';

  interface BadgeStyle {
    bg: string;
    text: string;
  }

  interface Reason {
    title: string;
    description: string;
    icon: IconName;
    badge: {
      text: string;
      color: BadgeColor;
    };
  }

  // Badge styles
  const badgeStyles: Record<BadgeColor, BadgeStyle> = {
    blue: {
      bg: 'bg-primary-blue/10',
      text: 'text-primary-blue'
    },
    yellow: {
      bg: 'bg-secondary-yellow/10',
      text: 'text-secondary-yellow'
    },
    red: {
      bg: 'bg-red-500/10',
      text: 'text-red-500'
    }
  };

  // Icon paths
  const icons: Record<IconName, string> = {
    lightning: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>`,
    target: `<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>`
  };

  // Reasons data
  const reasons: Reason[] = [
    {
      title: 'AI-zoeken groeit explosief',
      description: 'ChatGPT, Perplexity en Google Gemini veranderen de manier waarop mensen informatie vinden. Zorg dat jouw website voorop loopt.',
      icon: 'lightning',
      badge: {
        text: 'Trending',
        color: 'blue'
      }
    },
    {
      title: 'Voorkom dat je mist',
      description: 'AI-systemen vinden en begrijpen content anders dan traditionele zoekmachines. Optimaliseer nu om niet achter te lopen.',
      icon: 'shield',
      badge: {
        text: 'Cruciaal',
        color: 'red'
      }
    },
    {
      title: 'Concreet voordeel',
      description: 'Verbeter je vindbaarheid in AI-systemen en bereik meer potentiële klanten die AI gebruiken om informatie te vinden.',
      icon: 'target',
      badge: {
        text: 'Kans',
        color: 'yellow'
      }
    }
  ];

  function getBadgeStyle(color: BadgeColor) {
    return badgeStyles[color];
  }

  function getIcon(iconName: IconName) {
    return icons[iconName];
  }
</script>

<section class="py-20 bg-gradient-to-br from-bg-light via-white to-blue-50">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-header font-bold text-gray-900 mb-4">
        Waarom nu beginnen?
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        AI-systemen veranderen de manier waarop mensen informatie vinden. Zorg dat jouw website voorop loopt.
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
      {#each reasons as reason}
        <div class="glass p-6 rounded-2xl">
          <!-- Icon -->
          <div class="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {@html getIcon(reason.icon)}
            </svg>
          </div>
          
          <!-- Badge -->
          <div class="inline-flex items-center rounded-full {getBadgeStyle(reason.badge.color).bg} px-3 py-1 text-sm font-medium {getBadgeStyle(reason.badge.color).text} ring-1 ring-primary-blue/20 mb-4">
            {reason.badge.text}
          </div>
          
          <!-- Content -->
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">
            {reason.title}
          </h3>
          <p class="text-gray-600">
            {reason.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>