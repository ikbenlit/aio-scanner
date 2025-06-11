// src/lib/email/resend.ts
import { Resend } from 'resend';
import type { ScanResult } from './templates';
import { generateScanEmailTemplate, generateScanEmailText } from './templates';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
  }>;
}

export class ResendClient {
  private client: Resend;
  private fromEmail: string;
  private replyTo: string;
  
  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const replyTo = process.env.RESEND_REPLY_TO;
    
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }
    
    if (!fromEmail) {
      throw new Error('RESEND_FROM_EMAIL environment variable is required');
    }
    
    if (!replyTo) {
      throw new Error('RESEND_REPLY_TO environment variable is required');
    }
    
    this.client = new Resend(apiKey);
    this.fromEmail = fromEmail;
    this.replyTo = replyTo;
  }

  async sendEmail(options: EmailOptions) {
    try {
      const response = await this.client.emails.send({
        from: this.fromEmail,
        replyTo: this.replyTo,
        ...options
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Resend email error:', error);
      return { success: false, error };
    }
  }

  async sendScanReport(email: string, scanResult: ScanResult) {
    try {
      // Generate both HTML and plain text versions
      const html = generateScanEmailTemplate(scanResult);
      const text = generateScanEmailText(scanResult);

      // Get domain for subject line
      const domain = new URL(scanResult.url).hostname;
      
      const response = await this.sendEmail({
        to: email,
        subject: `Je AI-Gereedheid Scan Resultaten voor ${domain}`,
        html,
        text
      });

      if (!response.success) {
        throw new Error('Failed to send scan report email');
      }

      return response;
    } catch (error) {
      console.error('Error sending scan report:', error);
      return { success: false, error };
    }
  }
}