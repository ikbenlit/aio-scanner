import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  // TODO: Implementeer echte scan data ophalen
  return {
    scanId: params.scanId,
    // Mock data voor MVP
    scanData: {
      url: 'example.com',
      startTime: new Date().toISOString(),
      estimatedTime: 15, // seconden
      progress: 25 // percentage
    }
  };
}; 