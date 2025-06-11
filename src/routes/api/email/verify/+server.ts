import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export const POST = async ({ request }: RequestEvent) => {
  try {
    const { email } = await request.json();

    // Basic email validatie
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return json({ valid: false, error: 'Ongeldig email formaat' });
    }

    // Extra validatie hier (MX records, etc)

    return json({ valid: true });
  } catch (error) {
    return json({ error: 'Validatie mislukt' }, { status: 500 });
  }
}; 