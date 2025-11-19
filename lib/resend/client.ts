import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error(
    'RESEND_API_KEY is not defined in environment variables. Please add it to your .env.local file.'
  );
}

/**
 * Resend client instance
 * Configure in .env.local:
 * RESEND_API_KEY=re_xxx
 */
export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Email configuration
 */
export const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'Alpha Grit <noreply@alphagrit.vercel.app>',
  replyTo: process.env.EMAIL_REPLY_TO || 'support@alphagrit.vercel.app',

  // Test mode - set to true to use Resend test mode
  testMode: process.env.NODE_ENV === 'development',
} as const;

/**
 * Email template IDs (if using Resend's template feature)
 * For now we're using React Email components
 */
export const EMAIL_TEMPLATES = {
  PURCHASE_CONFIRMATION: 'purchase-confirmation',
  DOWNLOAD_LINK: 'download-link',
  REFUND_PROCESSED: 'refund-processed',
  WELCOME: 'welcome',
} as const;
