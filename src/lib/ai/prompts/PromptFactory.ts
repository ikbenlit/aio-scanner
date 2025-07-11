/**
 * PromptFactory - Registry-based factory for prompt strategies
 * 
 * This factory uses a registry pattern to manage prompt strategy creation
 * and provides a centralized way to create prompt strategies by type.
 * 
 * Auto-registration is handled by importing the strategy files, which
 * register themselves with the factory when imported.
 */

import type { PromptStrategy } from './PromptStrategy.js';

export type PromptType = 'insights' | 'narrative' | 'enterprise';

export class PromptFactory {
  private static registry = new Map<PromptType, () => PromptStrategy>();

  /**
   * Register a prompt strategy creator function
   * @param type - The prompt type identifier
   * @param creator - Function that creates a new instance of the strategy
   */
  static register(type: PromptType, creator: () => PromptStrategy): void {
    this.registry.set(type, creator);
  }

  /**
   * Create a new instance of a prompt strategy
   * @param type - The prompt type to create
   * @returns A new instance of the requested strategy
   * @throws Error if the prompt type is not registered
   */
  static create(type: PromptType): PromptStrategy {
    const creator = this.registry.get(type);
    if (!creator) {
      throw new Error(`Unknown prompt type: ${type}. Available types: ${Array.from(this.registry.keys()).join(', ')}`);
    }
    return creator();
  }

  /**
   * Get all registered prompt types
   * @returns Array of registered prompt type identifiers
   */
  static getRegisteredTypes(): PromptType[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Check if a prompt type is registered
   * @param type - The prompt type to check
   * @returns True if the type is registered, false otherwise
   */
  static isRegistered(type: PromptType): boolean {
    return this.registry.has(type);
  }

  /**
   * Get the number of registered prompt types
   * @returns Number of registered types
   */
  static getRegisteredCount(): number {
    return this.registry.size;
  }

  /**
   * Clear all registered prompt types (primarily for testing)
   * @internal
   */
  static clearRegistry(): void {
    this.registry.clear();
  }

  /**
   * Get registry statistics for debugging
   * @returns Object with registry information
   */
  static getRegistryInfo(): { types: PromptType[]; count: number } {
    return {
      types: this.getRegisteredTypes(),
      count: this.getRegisteredCount()
    };
  }
}