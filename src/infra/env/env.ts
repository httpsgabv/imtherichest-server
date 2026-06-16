import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),

  APP_NAME: z.string().default('Knitto Nest API'),
  APP_VERSION: z.string().default('1.0.0'),

  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3333),

  GLOBAL_PREFIX: z.string().default('api'),

  CORS_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173'),

  SENTRY_DSN: z.string().min(1),
  SENTRY_ENVIRONMENT: z
    .enum(['development', 'test', 'staging', 'production'])
    .default('development'),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().positive().default(0.1),
  SENTRY_ENABLED: z.string().default('true'),

  OPENAPI_APP_NAME: z.string().min(1),
  OPENAPI_APP_DESCRIPTION: z.string().min(1),

  DATABASE_URL: z.url().min(1),

  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().min(1).default(5432),

  LOG_PRISMA: z.string(),

  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url().min(1),

  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;
