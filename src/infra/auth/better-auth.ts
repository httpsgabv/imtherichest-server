import { AppPrismaClient } from '#infra/database/prisma/prisma.client.js';
import type { EmailProvider } from '#domain/email/ports/email.provider.js';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { dash } from '@better-auth/infra';

export class BetterAuth {
  constructor(
    private readonly prisma: AppPrismaClient,
    private readonly emailProvider?: EmailProvider,
  ) {}

  create() {
    return betterAuth({
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL,

      trustedOrigins:
        process.env.CORS_ORIGINS?.split(',')
          .map((o) => o.trim())
          .filter(Boolean) ?? [],

      database: prismaAdapter(this.prisma, {
        provider: 'postgresql',
      }),

      rateLimit: {
        enabled: process.env.NODE_ENV !== 'test',
      },

      emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url }) => {
          void this.emailProvider?.sendPasswordResetEmail({
            to: user.email,
            resetUrl: url,
          });
        },
      },

      socialProviders: this.createSocialProviders(),

      plugins: [
        dash({
          apiKey: process.env.BETTER_AUTH_API_KEY,
        }),
      ],
    });
  }

  private createSocialProviders() {
    const githubClientId = process.env.GITHUB_CLIENT_ID;
    const githubClientSecret = process.env.GITHUB_CLIENT_SECRET;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

    return {
      ...(githubClientId && githubClientSecret
        ? {
            github: {
              clientId: githubClientId,
              clientSecret: githubClientSecret,
            },
          }
        : {}),

      ...(googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {}),
    };
  }
}

export type BetterAuthInstance = ReturnType<BetterAuth['create']>;
