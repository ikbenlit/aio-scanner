<!-- src/lib/components/features/landing/FeatureSection.svelte -->
<script lang="ts">
  // Types
  type BadgeColor = 'blue' | 'yellow' | 'red' | 'green';
  type IconName = 'search' | 'chart' | 'document' | 'ai';

  interface BadgeStyle {
    bg: string;
    text: string;
    border: string;
  }

  interface Feature {
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
      text: 'text-primary-blue',
      border: 'ring-primary-blue/20'
    },
    yellow: {
      bg: 'bg-secondary-yellow/10',
      text: 'text-secondary-yellow',
      border: 'ring-secondary-yellow/20'
    },
    red: {
      bg: 'bg-red-500/10',
      text: 'text-red-500',
      border: 'ring-red-500/20'
    },
    green: {
      bg: 'bg-success-green/10',
      text: 'text-success-green',
      border: 'ring-success-green/20'
    }
  };

  // Icon paths
  const icons: Record<IconName, string> = {
    search: `<circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>`,
    chart: `<line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line>`,
    document: `<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line>`,
    ai: `<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z"></path><path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2"></path><path d="M19 11h2m-1 -1v2"></path>`
  };

  // Features data
  const features: Feature[] = [
    {
      title: 'AI-vindbaarheid score',
      description: 'Krijg een duidelijk beeld van hoe goed jouw website gevonden wordt door AI-systemen.',
      icon: 'search',
      badge: {
        text: 'Core feature',
        color: 'blue'
      }
    },
    {
      title: 'Gedetailleerde analyse',
      description: 'Ontdek precies waarom AI-systemen jouw content wel of niet goed begrijpen.',
      icon: 'chart',
      badge: {
        text: '8 modules',
        color: 'yellow'
      }
    },
    {
      title: 'Concrete verbeteringen',
      description: 'Krijg praktische tips en code voorbeelden om je website AI-proof te maken.',
      icon: 'document',
      badge: {
        text: 'Ready-to-use',
        color: 'green'
      }
    },
    {
      title: 'AI-optimalisatie',
      description: 'Leer hoe je je content optimaliseert voor de toekomst van zoeken.',
      icon: 'ai',
      badge: {
        text: 'Future-proof',
        color: 'red'
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

<section class="py-20 bg-white">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl font-header font-bold text-gray-900 mb-4">
        Waarom AI-vindbaarheid?
      </h2>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        AI-systemen zoals ChatGPT, Perplexity en Google Gemini veranderen de manier waarop mensen informatie vinden.
        Zorg dat jouw website voorop loopt.
      </p>
    </div>

    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each features as feature}
        <div class="glass p-6 rounded-2xl">
          <!-- Icon -->
          <div class="w-12 h-12 bg-primary-blue/10 rounded-xl flex items-center justify-center mb-6">
            <svg class="w-6 h-6 text-primary-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {@html getIcon(feature.icon)}
            </svg>
          </div>
          
          <!-- Badge -->
          <div class="inline-flex items-center rounded-full {getBadgeStyle(feature.badge.color).bg} px-3 py-1 text-sm font-medium {getBadgeStyle(feature.badge.color).text} ring-1 {getBadgeStyle(feature.badge.color).border} mb-4">
            {feature.badge.text}
          </div>
          
          <!-- Content -->
          <h3 class="text-xl font-header font-bold text-gray-900 mb-2">
            {feature.title}
          </h3>
          <p class="text-gray-600">
            {feature.description}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>