import { envSchema } from './env.js';

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);

  if (!result.success) {
    const formattedIssues = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    throw new Error(
      `Invalid environment variables:\n${JSON.stringify(formattedIssues, null, 2)}`,
    );
  }

  return result.data;
}
