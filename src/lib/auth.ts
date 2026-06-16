import { BetterAuth } from '#infra/auth/better-auth.js';
import { prisma } from '#infra/database/prisma/prisma.client.js';
import { MockEmailProvider } from '#infra/email/mock-email.provider.js';
import { ResendEmailProvider } from '#infra/email/resend-email.provider.js';
import type { EmailProvider } from '#domain/email/ports/email.provider.js';

function createEmailProvider(): EmailProvider {
  if (process.env.NODE_ENV === 'test') {
    return new MockEmailProvider();
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const appName = process.env.APP_NAME ?? 'App';

  if (!apiKey || !fromEmail) {
    throw new Error(
      'RESEND_API_KEY and RESEND_FROM_EMAIL must be set in non-test environments.',
    );
  }

  return new ResendEmailProvider(apiKey, fromEmail, appName);
}

const betterAuth = new BetterAuth(prisma, createEmailProvider());

export const auth = betterAuth.create();

export type Auth = typeof auth;
