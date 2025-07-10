// src/routes/checkout/+page.ts
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Smart URL formatting function
function formatAndValidateUrl(url: string): string {
  if (!url) {
    throw new Error('URL is required');
  }
  
  // Auto-add https:// if no protocol specified
  let formattedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    formattedUrl = `https://${url}`;
  }
  
  // Validate the formatted URL
  try {
    new URL(formattedUrl);
    return formattedUrl;
  } catch {
    throw new Error('Invalid URL format');
  }
}

export const load: PageLoad = async ({ url }) => {
  // Extract parameters from URL
  const tier = url.searchParams.get('tier');
  const scanUrl = url.searchParams.get('url');
  const email = url.searchParams.get('email');
  
  // Validate required parameters
  if (!tier || !scanUrl) {
    throw error(400, 'Tier en URL zijn verplicht');
  }
  
  // Validate tier
  if (!['starter', 'business', 'enterprise'].includes(tier)) {
    throw error(400, 'Ongeldige tier geselecteerd');
  }
  
  // Smart URL formatting and validation
  let formattedScanUrl: string;
  try {
    formattedScanUrl = formatAndValidateUrl(scanUrl);
  } catch (err) {
    throw error(400, 'Ongeldige URL format. Voer een geldige website URL in (bijv. mijnwebsite.nl)');
  }
  
  return {
    tier,
    scanUrl: formattedScanUrl, // Return the formatted URL
    email: email || '',
    tierConfig: {
      starter: {
        name: 'Starter',
        price: '€19,95',
        numericPrice: 19.95,
        description: 'Ideaal voor kleine bedrijven en freelancers',
        features: [
          'Alle Basic-functies',
          'AI-gegenereerd content rapport',
          'Downloadbare PDF-rapporten',
          'E-mail ondersteuning'
        ]
      },
      business: {
        name: 'Business',
        price: '€49,95',
        numericPrice: 49.95,
        description: 'Voor MKB en marketing professionals',
        features: [
          'Alle Starter-functies',
          'AI-auteur voor content verbetering',
          'Volledig narratief PDF-rapport',
          'Analyse van de versheid van content'
        ]
      },
      enterprise: {
        name: 'Enterprise',
        price: '€149,95',
        numericPrice: 149.95,
        description: 'Voor bureaus en grote ondernemingen',
        features: [
          'Alle Business-functies',
          'Multi-pagina scan & analyse',
          'Concurrentie-analyse',
          'Strategische roadmap'
        ]
      }
    }
  };
};