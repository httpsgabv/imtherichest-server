import type { Env } from '#infra/env/env.js';
import type { IEnvService } from '#infra/env/interfaces/IEnvService.js';

export class FakeEnvService implements IEnvService {
  private values: Env = {
    APP_NAME: 'test-app',
    APP_VERSION: '1.0.0',
    NODE_ENV: 'test',
    HOST: '0.0.0.0',
    PORT: 3333,
    GLOBAL_PREFIX: 'api',
    CORS_ORIGINS: '',
    SENTRY_DSN: '',
    SENTRY_ENVIRONMENT: 'development',
    SENTRY_TRACES_SAMPLE_RATE: 0,
    SENTRY_ENABLED: '',
    OPENAPI_APP_NAME: '',
    OPENAPI_APP_DESCRIPTION: '',
    DATABASE_URL: '',
    POSTGRES_USER: '',
    POSTGRES_PASSWORD: '',
    POSTGRES_DB: '',
    POSTGRES_PORT: 0,
    LOG_PRISMA: '',
    BETTER_AUTH_SECRET: '',
    BETTER_AUTH_URL: '',
  };

  set(key: keyof Env, value: Env[keyof Env]): void {
    (this.values as Record<keyof Env, Env[keyof Env]>)[key] = value;
  }

  get<T extends keyof Env>(key: T): Env[T] {
    return this.values[key];
  }

  getCorsOrigins(): string[] {
    return this.get('CORS_ORIGINS')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  }

  isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }
}
