// src/lib/ai/vertexTest.ts - Quick connection test
import { VertexAI } from '@google-cloud/vertexai';
import { GOOGLE_CLOUD_PROJECT, VERTEX_AI_LOCATION, GOOGLE_APPLICATION_CREDENTIALS } from '$env/static/private';
import { resolve } from 'path';

export async function testVertexConnection(): Promise<void> {
  try {
    console.log('🔌 Testing Vertex AI connection...');
    console.log('📋 Project:', GOOGLE_CLOUD_PROJECT);
    console.log('📍 Location: europe-west1');
    console.log('🔑 Credentials path:', GOOGLE_APPLICATION_CREDENTIALS);
    
    // Set environment variable for Google Auth
    process.env.GOOGLE_APPLICATION_CREDENTIALS = resolve(GOOGLE_APPLICATION_CREDENTIALS);
    console.log('🔑 Resolved credentials path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);
    
    const vertex = new VertexAI({
      project: GOOGLE_CLOUD_PROJECT,
      location: 'europe-west1' // EU regio voor AVG compliance
    });

    const model = vertex.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });

    const prompt = 'Say hello and confirm you are working!';
    
    console.log('📤 Sending test prompt...');
    const result = await model.generateContent(prompt);
    
    console.log('📥 Response received:');
    console.log(result.response.candidates?.[0]?.content?.parts?.[0]?.text || 'No response text');
    
    console.log('✅ Vertex AI connection successful!');
    
  } catch (error) {
    console.error('❌ Vertex AI connection failed:', error);
    throw error;
  }
}
