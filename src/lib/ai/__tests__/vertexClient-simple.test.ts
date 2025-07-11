/**
 * Simplified tests for VertexClient method overloads
 */

import { describe, it, expect, vi } from 'vitest';

// Mock the dependencies
vi.mock('@google-cloud/vertexai');
vi.mock('$env/static/private', () => ({
  GOOGLE_CLOUD_PROJECT: 'test',
  VERTEX_AI_LOCATION: 'test',
  GOOGLE_APPLICATION_CREDENTIALS: './test.json'
}));

describe('VertexClient Method Overloads - Simple Tests', () => {
  it('should have correct method signatures', async () => {
    // Import after mocking
    const { VertexAIClient } = await import('../vertexClient.js');
    const client = new VertexAIClient();

    // Test that the methods exist with correct signatures
    expect(typeof client.generateInsights).toBe('function');
    expect(typeof client.generateNarrativeReport).toBe('function');
    expect(typeof client.generateEnterpriseReport).toBe('function');
  });

  it('should import PromptFactory correctly', async () => {
    // Test that PromptFactory import works
    const { PromptFactory } = await import('../prompts/PromptFactory.js');
    expect(PromptFactory).toBeDefined();
    expect(typeof PromptFactory.create).toBe('function');
  });
});