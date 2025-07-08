// src/lib/results/interpretation.ts
// Score interpretation system - transforms technical scores into business-friendly insights

export interface ScoreInterpretation {
  level: string;
  message: string;
  color: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

/**
 * Transforms a numerical score into business-friendly interpretation
 * Based on the redesign plan: positive framing, no red colors, business language
 */
export function getScoreInterpretation(score: number): ScoreInterpretation {
  if (score >= 80) {
    return {
      level: "Uitstekend",
      message: "Je website is goed voorbereid op AI-zoekmachines",
      color: "green",
      icon: "🏆",
      bgColor: "bg-green-50",
      textColor: "text-green-800"
    };
  }
  
  if (score >= 60) {
    return {
      level: "Goed", 
      message: "Je website doet het goed, met enkele verbeterpunten",
      color: "blue",
      icon: "👍",
      bgColor: "bg-blue-50",
      textColor: "text-blue-800"
    };
  }
  
  if (score >= 40) {
    return {
      level: "Redelijk",
      message: "Je website heeft groeipotentieel voor AI-vindbaarheid", 
      color: "orange",
      icon: "📈",
      bgColor: "bg-orange-50",
      textColor: "text-orange-800"
    };
  }
  
  // Below 40 - stay positive, use purple instead of red
  return {
    level: "Verbetering mogelijk",
    message: "Met enkele aanpassingen wordt je website veel beter vindbaar",
    color: "purple",
    icon: "🚀",
    bgColor: "bg-purple-50",
    textColor: "text-purple-800"
  };
}

/**
 * Get contextual message about the score range
 * Provides context without specific percentages (we don't have benchmark data yet)
 */
export function getScoreContext(score: number): string {
  if (score >= 80) {
    return "Dit is een sterke score. De meeste websites scoren tussen 40-70.";
  }
  
  if (score >= 60) {
    return "Dit is een goede score. Je bent op de goede weg.";
  }
  
  if (score >= 40) {
    return "Er is nog groeipotentieel. Met enkele aanpassingen kom je hoger.";
  }
  
  return "Met de juiste stappen kun je een flinke verbetering behalen.";
}

/**
 * Get the appropriate Tailwind color classes for the score
 */
export function getScoreColorClasses(score: number): {
  circleColor: string;
  textColor: string;
  iconColor: string;
} {
  const interpretation = getScoreInterpretation(score);
  
  switch (interpretation.color) {
    case 'green':
      return {
        circleColor: 'stroke-green-500',
        textColor: 'text-green-700',
        iconColor: 'text-green-600'
      };
    case 'blue':
      return {
        circleColor: 'stroke-blue-500',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600'
      };
    case 'orange':
      return {
        circleColor: 'stroke-orange-500',
        textColor: 'text-orange-700',
        iconColor: 'text-orange-600'
      };
    case 'purple':
      return {
        circleColor: 'stroke-purple-500',
        textColor: 'text-purple-700',
        iconColor: 'text-purple-600'
      };
    default:
      return {
        circleColor: 'stroke-gray-500',
        textColor: 'text-gray-700',
        iconColor: 'text-gray-600'
      };
  }
}