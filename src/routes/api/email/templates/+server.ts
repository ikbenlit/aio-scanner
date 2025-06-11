import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Template preview functie
async function generateTemplatePreview(template: string, data: any): Promise<string> {
  // Eenvoudige template engine - vervang placeholders
  let html = template;
  
  if (data) {
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      html = html.replace(new RegExp(placeholder, 'g'), data[key] || '');
    });
  }
  
  return html;
}

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { template, data } = await request.json();

    // Template preview genereren
    const html = await generateTemplatePreview(template, data);

    return json({ html });
  } catch (error) {
    return json({ error: 'Template preview mislukt' }, { status: 500 });
  }
};
