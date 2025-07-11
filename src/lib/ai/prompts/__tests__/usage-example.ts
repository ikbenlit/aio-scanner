/**
 * Usage example for PromptFactory
 * 
 * This demonstrates how to use the PromptFactory in practice
 * and how auto-registration works.
 */

import { PromptFactory, type PromptInput, type PromptType } from '../index.js';

// Example: Create a prompt strategy dynamically
function createPromptStrategy(type: PromptType) {
  return PromptFactory.create(type);
}

// Example: Generate a prompt based on user input
function generatePrompt(type: PromptType, input: PromptInput): string {
  const strategy = PromptFactory.create(type);
  return strategy.buildPrompt(input);
}

// Example: List all available prompt types
function getAvailablePromptTypes(): PromptType[] {
  return PromptFactory.getRegisteredTypes();
}

// Example: Check if a prompt type is available
function isPromptTypeAvailable(type: PromptType): boolean {
  return PromptFactory.isRegistered(type);
}

// Example usage:
export function demonstratePromptFactory() {
  console.log('Available prompt types:', getAvailablePromptTypes());
  
  // Create different strategies
  const insightsStrategy = createPromptStrategy('insights');
  const narrativeStrategy = createPromptStrategy('narrative');
  const enterpriseStrategy = createPromptStrategy('enterprise');
  
  // Generate prompts
  const sampleInput: PromptInput = {
    moduleResults: [],
    url: 'https://example.com'
  };
  
  const insightsPrompt = generatePrompt('insights', sampleInput);
  console.log('Insights prompt length:', insightsPrompt.length);
  
  // Check availability
  console.log('Is insights available?', isPromptTypeAvailable('insights'));
  console.log('Is narrative available?', isPromptTypeAvailable('narrative'));
  console.log('Is enterprise available?', isPromptTypeAvailable('enterprise'));
  
  console.log('Registry info:', PromptFactory.getRegistryInfo());
}

// This would be called in actual usage:
// demonstratePromptFactory();