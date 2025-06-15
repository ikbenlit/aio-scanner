// src/routes/api/test/vertex/+server.ts
import { json } from '@sveltejs/kit';
import { testVertexConnection } from '$lib/ai/vertexTest.js';

export async function GET() {
  try {
    await testVertexConnection();
    return json({ success: true, message: 'Vertex AI working!' });
  } catch (error) {
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}