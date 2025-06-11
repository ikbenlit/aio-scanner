// src/routes/api/email/send/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ResendClient } from '$lib/email/resend';
import { EmailRateLimiter } from '$lib/email/rateLimiter';
import { logEmailEvent } from '$lib/email/monitoring';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, scanId } = await request.json();

    // Validatie
    if (!email || !scanId) {
      return json({ error: 'Email en scan ID zijn verplicht' }, { status: 400 });
    }

    // Rate limiting check
    if (!EmailRateLimiter.canSendEmail(email)) {
      return json({ error: 'Te veel email verzoeken' }, { status: 429 });
    }

    const resend = new ResendClient();
    const result = await resend.sendEmail({
      to: email,
      subject: 'Je SEO Scan Resultaten',
      html: '...', // Template hier invoegen
    });

    // Log success
    logEmailEvent('send', { email, scanId, success: true });

    return json({ success: true, messageId: result.data?.id });

  } catch (error) {
    // Log error
    logEmailEvent('error', { error });
    return json({ error: 'Email verzenden mislukt' }, { status: 500 });
  }
};