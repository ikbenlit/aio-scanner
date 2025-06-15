// src/routes/api/scan/anonymous/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
  console.warn('⚠️ DEPRECATED: /api/scan/anonymous - gebruik /api/scan/basic');
  
  try {
    // Get the request body
    const body = await request.json();
    
    // Forward to basic endpoint with all the same data
    const basicResponse = await fetch('/api/scan/basic', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Forwarded-For': getClientAddress() // Pass IP for potential rate limiting
      },
      body: JSON.stringify(body)
    });
    
    // Return the exact response from basic endpoint
    const responseData = await basicResponse.json();
    return json(responseData, { status: basicResponse.status });
    
  } catch (e: any) {
    console.error('Anonymous scan wrapper failed:', e);
    return json({ message: 'Internal Server Error' }, { status: 500 });
  }
};