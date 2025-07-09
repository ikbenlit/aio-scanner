// src/lib/results/prioritization.ts
// Prioritization logic: selects top 3 quick wins for maximum user value

import type { BusinessAction } from './translation';

export interface PrioritizedAction extends BusinessAction {
  priorityScore: number;
  reasoning: string;
}

/**
 * Calculate priority score for a business action
 * Higher score = higher priority for display
 */
function calculatePriorityScore(action: BusinessAction): number {
  let score = 0;

  // 1. Base priority (40% of total score)
  switch (action.priority) {
    case 'high':
      score += 40;
      break;
    case 'medium':
      score += 25;
      break;
    case 'low':
      score += 10;
      break;
  }

  // 2. Difficulty bonus (30% of total score) - favor easy wins
  switch (action.difficulty) {
    case 'makkelijk':
      score += 30;
      break;
    case 'gemiddeld':
      score += 20;
      break;
    case 'uitdagend':
      score += 5;
      break;
  }

  // 3. Time estimate bonus (20% of total score) - favor quick wins
  const timeNumber = parseInt(action.timeEstimate);
  if (timeNumber <= 15) {
    score += 20; // 15 minutes or less
  } else if (timeNumber <= 30) {
    score += 15; // 30 minutes or less
  } else if (timeNumber <= 60) {
    score += 10; // 1 hour or less
  } else {
    score += 5; // More than 1 hour
  }

  // 4. Impact bonus (10% of total score) - favor high impact
  const impactNumber = parseInt(action.impactPoints.replace(/[^\d]/g, ''));
  if (impactNumber >= 12) {
    score += 10;
  } else if (impactNumber >= 8) {
    score += 7;
  } else if (impactNumber >= 5) {
    score += 5;
  } else {
    score += 2;
  }

  // 5. Category bonuses (bonus points for strategic categories)
  switch (action.category) {
    case 'business-info':
      score += 8; // Foundation for AI trust
      break;
    case 'ai-content':
      score += 7; // Direct AI optimization
      break;
    case 'authority':
      score += 6; // Credibility building
      break;
    case 'metadata':
      score += 5; // Technical but visible impact
      break;
    case 'freshness':
      score += 4; // Ongoing maintenance
      break;
    case 'technical':
      score += 3; // Important but less visible
      break;
    default:
      score += 2;
  }

  return score;
}

/**
 * Generate reasoning for why an action was prioritized
 */
function generateReasoning(action: BusinessAction, score: number): string {
  const reasons: string[] = [];

  if (action.priority === 'high') {
    reasons.push('Hoge impact op AI-vindbaarheid');
  }

  if (action.difficulty === 'makkelijk') {
    reasons.push('Snel te implementeren');
  }

  const timeNumber = parseInt(action.timeEstimate);
  if (timeNumber <= 30) {
    reasons.push('Weinig tijd nodig');
  }

  const impactNumber = parseInt(action.impactPoints.replace(/[^\d]/g, ''));
  if (impactNumber >= 10) {
    reasons.push('Grote score verbetering');
  }

  if (action.category === 'business-info') {
    reasons.push('Fundament voor AI-vertrouwen');
  } else if (action.category === 'ai-content') {
    reasons.push('Direct AI-geoptimaliseerd');
  } else if (action.category === 'authority') {
    reasons.push('Verhoogt credibiliteit');
  }

  return reasons.join(' • ');
}

/**
 * Selects top 3 quick wins from business actions
 * Balances impact, effort, and strategic value
 */
export function selectTop3QuickWins(actions: BusinessAction[]): PrioritizedAction[] {
  if (actions.length === 0) {
    return [];
  }

  // Calculate priority scores
  const prioritizedActions: PrioritizedAction[] = actions.map(action => {
    const priorityScore = calculatePriorityScore(action);
    const reasoning = generateReasoning(action, priorityScore);

    return {
      ...action,
      priorityScore,
      reasoning
    };
  });

  // Sort by priority score (highest first)
  const sorted = prioritizedActions.sort((a, b) => b.priorityScore - a.priorityScore);

  // Apply strategic filtering to ensure diversity
  const selected: PrioritizedAction[] = [];
  const usedCategories = new Set<string>();

  // First pass: select highest priority from each category
  for (const action of sorted) {
    if (selected.length >= 3) break;

    if (!usedCategories.has(action.category)) {
      selected.push(action);
      usedCategories.add(action.category);
    }
  }

  // Second pass: fill remaining slots with highest scoring actions
  for (const action of sorted) {
    if (selected.length >= 3) break;

    if (!selected.some(s => s.id === action.id)) {
      selected.push(action);
    }
  }

  // Ensure we have exactly 3 or fewer
  return selected.slice(0, 3);
}

/**
 * Analyzes the balance of selected quick wins
 */
export function analyzeQuickWinsBalance(quickWins: PrioritizedAction[]): {
  hasEasyWin: boolean;
  hasMediumWin: boolean;
  hasHighImpact: boolean;
  totalTimeEstimate: number;
  totalImpactPoints: number;
  coverageScore: number;
} {
  const analysis = {
    hasEasyWin: false,
    hasMediumWin: false,
    hasHighImpact: false,
    totalTimeEstimate: 0,
    totalImpactPoints: 0,
    coverageScore: 0
  };

  let totalTime = 0;
  let totalImpact = 0;
  const categories = new Set<string>();

  for (const win of quickWins) {
    // Check difficulty balance
    if (win.difficulty === 'makkelijk') {
      analysis.hasEasyWin = true;
    }
    if (win.difficulty === 'gemiddeld') {
      analysis.hasMediumWin = true;
    }

    // Check impact
    const impactNumber = parseInt(win.impactPoints.replace(/[^\d]/g, ''));
    if (impactNumber >= 10) {
      analysis.hasHighImpact = true;
    }
    totalImpact += impactNumber;

    // Calculate time
    const timeNumber = parseInt(win.timeEstimate);
    totalTime += timeNumber;

    // Track categories for diversity
    categories.add(win.category);
  }

  analysis.totalTimeEstimate = totalTime;
  analysis.totalImpactPoints = totalImpact;
  analysis.coverageScore = (categories.size / Math.max(quickWins.length, 1)) * 100;

  return analysis;
}

/**
 * Get strategic recommendation for improving quick wins selection
 */
export function getQuickWinsRecommendation(
  quickWins: PrioritizedAction[],
  allActions: BusinessAction[]
): string | null {
  const balance = analyzeQuickWinsBalance(quickWins);

  if (quickWins.length === 0) {
    return 'Geen quick wins gevonden. Controleer scan resultaten.';
  }

  if (quickWins.length < 3 && allActions.length > quickWins.length) {
    return 'Meer acties beschikbaar in het volledige rapport.';
  }

  if (!balance.hasEasyWin && balance.totalTimeEstimate > 120) {
    return 'Overweeg om te starten met kortere acties voor snelle resultaten.';
  }

  if (balance.coverageScore < 50) {
    return 'Gevarieerde aanpak voor beste resultaten beschikbaar in volledig rapport.';
  }

  if (balance.totalImpactPoints < 20) {
    return 'Meer impactvolle optimalisaties beschikbaar in premium rapport.';
  }

  return null; // No specific recommendation needed
}

/**
 * Format time estimate for display
 */
export function formatTimeEstimate(timeEstimate: string): {
  display: string;
  sortValue: number;
  icon: string;
} {
  const timeNumber = parseInt(timeEstimate);
  
  if (timeNumber <= 15) {
    return {
      display: timeEstimate,
      sortValue: timeNumber,
      icon: '⚡'
    };
  } else if (timeNumber <= 30) {
    return {
      display: timeEstimate,
      sortValue: timeNumber,
      icon: '🟢'
    };
  } else if (timeNumber <= 60) {
    return {
      display: timeEstimate,
      sortValue: timeNumber,
      icon: '🟡'
    };
  } else {
    return {
      display: timeEstimate,
      sortValue: timeNumber,
      icon: '🔴'
    };
  }
}

/**
 * Selects 3 varied quick wins for Basic tier (free users)
 * Strategy: 1 AI-category action + 2 highest impact other actions
 * Ensures at least one <15min task with ≥8 points for instant gratification
 */
export function selectVariedQuickWins(actions: BusinessAction[]): PrioritizedAction[] {
  if (actions.length === 0) {
    return [];
  }

  // Calculate priority scores for all actions
  const prioritizedActions: PrioritizedAction[] = actions.map(action => {
    const priorityScore = calculatePriorityScore(action);
    const reasoning = generateReasoning(action, priorityScore);

    return {
      ...action,
      priorityScore,
      reasoning
    };
  });

  // Sort by priority score
  const sorted = prioritizedActions.sort((a, b) => b.priorityScore - a.priorityScore);

  // 1. Find AI-category actions (business-info, ai-content, authority)
  const aiCategories = ['business-info', 'ai-content', 'authority'];
  const aiActions = sorted.filter(action => aiCategories.includes(action.category));
  
  // 2. Find non-AI actions
  const nonAiActions = sorted.filter(action => !aiCategories.includes(action.category));

  const selected: PrioritizedAction[] = [];

  // 3. Select 1 AI-category action (preferably high scoring)
  if (aiActions.length > 0) {
    // Randomize among top 3 AI actions to provide variety
    const topAiActions = aiActions.slice(0, Math.min(3, aiActions.length));
    const randomAiAction = topAiActions[Math.floor(Math.random() * topAiActions.length)];
    selected.push(randomAiAction);
  }

  // 4. Select 2 highest impact non-AI actions
  let addedNonAi = 0;
  for (const action of nonAiActions) {
    if (addedNonAi >= 2) break;
    
    // Skip if already selected
    if (selected.some(s => s.id === action.id)) continue;
    
    selected.push(action);
    addedNonAi++;
  }

  // 5. If we don't have enough non-AI actions, fill with remaining actions
  while (selected.length < 3 && selected.length < sorted.length) {
    for (const action of sorted) {
      if (selected.length >= 3) break;
      
      if (!selected.some(s => s.id === action.id)) {
        selected.push(action);
        break;
      }
    }
  }

  // 6. Ensure we have at least one <15min task with ≥8 points for instant gratification
  const hasQuickWin = selected.some(action => {
    const timeNumber = parseInt(action.timeEstimate);
    const impactNumber = parseInt(action.impactPoints.replace(/[^\d]/g, ''));
    return timeNumber <= 15 && impactNumber >= 8;
  });

  // If no quick win, try to replace the lowest scoring action with a quick win
  if (!hasQuickWin) {
    const quickWinCandidates = sorted.filter(action => {
      const timeNumber = parseInt(action.timeEstimate);
      const impactNumber = parseInt(action.impactPoints.replace(/[^\d]/g, ''));
      return timeNumber <= 15 && impactNumber >= 8 && !selected.some(s => s.id === action.id);
    });

    if (quickWinCandidates.length > 0) {
      // Replace the lowest scoring selected action with a quick win
      const lowestScoreIndex = selected.reduce((minIndex, action, index) => 
        action.priorityScore < selected[minIndex].priorityScore ? index : minIndex, 0);
      
      selected[lowestScoreIndex] = quickWinCandidates[0];
    }
  }

  return selected.slice(0, 3);
}

/**
 * Check if actions represent AI-related categories
 * Used for Basic tier AI-preview filtering
 */
export function isAICategory(category: string): boolean {
  const aiCategories = ['business-info', 'ai-content', 'authority'];
  return aiCategories.includes(category);
}

/**
 * Get AI-preview badge text for Basic tier
 */
export function getAIPreviewBadge(quickWins: PrioritizedAction[]): string | null {
  const aiActions = quickWins.filter(action => isAICategory(action.category));
  
  if (aiActions.length > 0) {
    return `🤖 AI-Preview (${aiActions.length}/3)`;
  }
  
  return null;
}