// src/lib/email/client.ts - Debug version
import { Resend } from 'resend';
import { RESEND_API_KEY, RESEND_FROM_EMAIL, RESEND_REPLY_TO } from '$env/static/private';

console.log('🔑 Resend API Key loaded:', RESEND_API_KEY ? 'YES' : 'NO');
console.log('🔑 API Key prefix:', RESEND_API_KEY?.substring(0, 6));

export const resend = new Resend(RESEND_API_KEY);

interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
  from?: string;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<EmailSendResult> {
  try {
    console.log('📧 Attempting to send email with options:', {
      to: options.to,
      subject: options.subject,
      hasAttachments: !!options.attachments?.length
    });

    const result = await resend.emails.send({
      from: options.from || RESEND_FROM_EMAIL || 'noreply@ikbenlit.nl',
      replyTo: RESEND_REPLY_TO || 'colin@ikbenlit.nl',
      to: options.to,
      subject: options.subject,
      html: options.html,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType
      }))
    });

    console.log('📧 Email sent successfully:', result);

    return {
      success: true,
      messageId: result.data?.id,
      error: undefined
    };

  } catch (error: unknown) {
    console.error('📧 Email send error:', error);
    return {
      success: false,
      messageId: undefined,
      error: error instanceof Error ? error.message : 'Onbekende fout bij versturen email'
    };
  }
}