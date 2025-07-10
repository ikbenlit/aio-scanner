<!-- src/lib/components/features/results/ImpactEffortMatrix.svelte -->
<script lang="ts">
  import type { ThematicGroup } from '$lib/results/thematic-grouping';
  
  export let themes: ThematicGroup[];
  
  interface MatrixItem {
    title: string;
    theme: string;
    themeIcon: string;
    impact: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    priority: number;
    action: string;
  }
  
  // Transform theme quick fixes into matrix items
  function generateMatrixItems(themes: ThematicGroup[]): MatrixItem[] {
    const items: MatrixItem[] = [];
    
    themes.forEach(theme => {
      theme.quickFixes.forEach((fix, index) => {
        // Estimate effort based on theme and action content
        const effort = estimateEffort(fix, theme.id);
        
        items.push({
          title: `${theme.name}: ${fix.substring(0, 30)}${fix.length > 30 ? '...' : ''}`,
          theme: theme.name,
          themeIcon: theme.icon,
          impact: theme.impact,
          effort,
          priority: theme.priority,
          action: fix
        });
      });
    });
    
    return items.slice(0, 8); // Limit to 8 items for readability
  }
  
  // Estimate effort based on action content
  function estimateEffort(action: string, themeId: string): 'high' | 'medium' | 'low' {
    const lowEffortKeywords = ['voeg toe', 'update', 'verwijder', 'link', 'tag'];
    const highEffortKeywords = ['implementeer', 'ontwikkel', 'ontwerp', 'schrijf uitgebreid'];
    
    const actionLower = action.toLowerCase();
    
    if (lowEffortKeywords.some(keyword => actionLower.includes(keyword))) {
      return 'low';
    }
    if (highEffortKeywords.some(keyword => actionLower.includes(keyword))) {
      return 'high';
    }
    
    // Theme-based estimation
    if (themeId === 'findability') return 'medium';
    if (themeId === 'trust') return 'low';
    if (themeId === 'conversion') return 'medium';
    if (themeId === 'freshness') return 'low';
    
    return 'medium';
  }
  
  // Get position in matrix
  function getMatrixPosition(impact: string, effort: string): { x: number; y: number } {
    const impactMap = { high: 90, medium: 50, low: 10 };
    const effortMap = { low: 10, medium: 50, high: 90 };
    
    return {
      x: effortMap[effort as keyof typeof effortMap],
      y: impactMap[impact as keyof typeof impactMap]
    };
  }
  
  // Get priority color
  function getPriorityColor(impact: string, effort: string): string {
    if (impact === 'high' && effort === 'low') return 'bg-green-500 border-green-600'; // Quick wins
    if (impact === 'high' && effort === 'medium') return 'bg-blue-500 border-blue-600'; // Major projects
    if (impact === 'medium' && effort === 'low') return 'bg-yellow-500 border-yellow-600'; // Fill-ins
    return 'bg-gray-400 border-gray-500'; // Thankless tasks
  }
  
  // Get priority label
  function getPriorityLabel(impact: string, effort: string): string {
    if (impact === 'high' && effort === 'low') return 'Quick Win! 🎯';
    if (impact === 'high' && effort === 'medium') return 'Belangrijke project 📈';
    if (impact === 'medium' && effort === 'low') return 'Nice to have ✨';
    return 'Overwegen 🤔';
  }
  
  $: matrixItems = generateMatrixItems(themes);
  
  // Group items by priority category
  $: priorityGroups = {
    quickWins: matrixItems.filter(item => item.impact === 'high' && item.effort === 'low'),
    majorProjects: matrixItems.filter(item => item.impact === 'high' && item.effort !== 'low'),
    fillIns: matrixItems.filter(item => item.impact === 'medium' && item.effort === 'low'),
    others: matrixItems.filter(item => !(
      (item.impact === 'high' && item.effort === 'low') ||
      (item.impact === 'high' && item.effort !== 'low') ||
      (item.impact === 'medium' && item.effort === 'low')
    ))
  };
</script>

{#if matrixItems.length > 0}
  <div class="bg-white rounded-xl p-6 border border-gray-200">
    <div class="flex items-center gap-3 mb-6">
      <span class="text-2xl">🎯</span>
      <div>
        <h3 class="text-lg font-semibold text-gray-900">Prioriteit Matrix</h3>
        <p class="text-sm text-gray-600">Impact vs Inspanning - waar moet je beginnen?</p>
      </div>
    </div>
    
    <!-- Visual Matrix -->
    <div class="mb-8">
      <div class="relative bg-gray-50 rounded-lg p-6" style="height: 320px;">
        <!-- Axis Labels -->
        <div class="absolute -left-6 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-600">
          Impact
        </div>
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6 text-xs font-medium text-gray-600">
          Inspanning
        </div>
        
        <!-- Grid Lines -->
        <div class="absolute inset-0 m-6">
          <!-- Horizontal lines -->
          <div class="absolute top-0 left-0 right-0 border-t border-gray-200"></div>
          <div class="absolute top-1/2 left-0 right-0 border-t border-gray-300"></div>
          <div class="absolute bottom-0 left-0 right-0 border-t border-gray-200"></div>
          
          <!-- Vertical lines -->
          <div class="absolute top-0 bottom-0 left-0 border-l border-gray-200"></div>
          <div class="absolute top-0 bottom-0 left-1/2 border-l border-gray-300"></div>
          <div class="absolute top-0 bottom-0 right-0 border-l border-gray-200"></div>
        </div>
        
        <!-- Quadrant Labels -->
        <div class="absolute top-2 left-2 text-xs text-gray-500 font-medium">Hoge Impact, Lage Inspanning</div>
        <div class="absolute top-2 right-2 text-xs text-gray-500 font-medium">Hoge Impact, Hoge Inspanning</div>
        <div class="absolute bottom-2 left-2 text-xs text-gray-500 font-medium">Lage Impact, Lage Inspanning</div>
        <div class="absolute bottom-2 right-2 text-xs text-gray-500 font-medium">Lage Impact, Hoge Inspanning</div>
        
        <!-- Data Points -->
        {#each matrixItems as item, index}
          {@const position = getMatrixPosition(item.impact, item.effort)}
          <div 
            class="absolute w-3 h-3 rounded-full {getPriorityColor(item.impact, item.effort)} border-2 transform -translate-x-1/2 -translate-y-1/2 hover:scale-150 transition-transform cursor-help"
            style="left: {position.x}%; top: {100 - position.y}%"
            title="{item.action}"
          >
            <span class="sr-only">{item.action}</span>
          </div>
        {/each}
      </div>
    </div>
    
    <!-- Priority Lists -->
    <div class="grid lg:grid-cols-2 gap-6">
      <!-- Quick Wins -->
      {#if priorityGroups.quickWins.length > 0}
        <div class="bg-green-50 rounded-lg p-5 border border-green-200">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-green-500 rounded-full border-2 border-green-600"></div>
            <h4 class="font-semibold text-green-800">🎯 Quick Wins (Start hier!)</h4>
          </div>
          
          <div class="space-y-3">
            {#each priorityGroups.quickWins as item}
              <div class="bg-white rounded-lg p-3 border border-green-200">
                <div class="flex items-start gap-2">
                  <span class="text-lg flex-shrink-0">{item.themeIcon}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-1">{item.theme}</p>
                    <p class="text-xs text-gray-700">{item.action}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
      
      <!-- Major Projects -->
      {#if priorityGroups.majorProjects.length > 0}
        <div class="bg-blue-50 rounded-lg p-5 border border-blue-200">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-600"></div>
            <h4 class="font-semibold text-blue-800">📈 Belangrijke Projecten</h4>
          </div>
          
          <div class="space-y-3">
            {#each priorityGroups.majorProjects as item}
              <div class="bg-white rounded-lg p-3 border border-blue-200">
                <div class="flex items-start gap-2">
                  <span class="text-lg flex-shrink-0">{item.themeIcon}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-900 mb-1">{item.theme}</p>
                    <p class="text-xs text-gray-700">{item.action}</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
    
    <!-- Advice -->
    <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div class="flex items-start gap-3">
        <span class="text-xl">💡</span>
        <div>
          <p class="text-sm font-medium text-blue-800 mb-1">Advies voor maximale impact:</p>
          <p class="text-xs text-blue-700 leading-relaxed">
            Focus eerst op de <strong>Quick Wins</strong> (groene punten) - deze geven je de meeste AI-optimalisatie voor de minste moeite. 
            Plan daarna de belangrijke projecten in wanneer je meer tijd hebt.
          </p>
        </div>
      </div>
    </div>
  </div>
{/if} 