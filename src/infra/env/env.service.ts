import { Injectable } from '@nestjs/common';
import type { Env } from './env.js';
import { ConfigService } from '@nestjs/config';
import { IEnvService } from '#infra/env/interfaces/IEnvService.js';

@Injectable()
export class EnvService implements IEnvService {
  constructor(private readonly configService: ConfigService<Env, true>) {}

  get nodeEnv(): string {
    return this.get('NODE_ENV');
  }

  get appName(): string {
    return this.get('APP_NAME');
  }

  get appVersion(): string {
    return this.get('APP_VERSION');
  }

  get HOST(): string {
    return this.get('HOST');
  }

  get port(): number {
    return this.get('PORT');
  }

  get globalPrefix(): string {
    return this.get('GLOBAL_PREFIX');
  }

  get corsOrigin(): string {
    return this.get('CORS_ORIGINS');
  }

  get sentryDsn(): string {
    return this.get('SENTRY_DSN');
  }

  get sentryEnvironment(): string {
    return this.get('SENTRY_ENVIRONMENT');
  }

  get sentryTracesSampleRate(): number {
    return this.get('SENTRY_TRACES_SAMPLE_RATE');
  }

  get sentryEnabled(): string {
    return this.get('SENTRY_ENABLED');
  }

  get openApiAppName(): string {
    return this.get('OPENAPI_APP_NAME');
  }

  get openApiAppDescription(): string {
    return this.get('OPENAPI_APP_DESCRIPTION');
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get postgresUser(): string {
    return this.get('POSTGRES_USER');
  }

  get postgresPassword(): string {
    return this.get('POSTGRES_PASSWORD');
  }

  get postgresDb(): string {
    return this.get('POSTGRES_DB');
  }

  get postgresPort(): number {
    return this.get('POSTGRES_PORT');
  }

  get logPrisma(): string {
    return this.get('LOG_PRISMA');
  }

  get resendApiKey(): string | undefined {
    return this.configService.get('RESEND_API_KEY');
  }

  get resendFromEmail(): string | undefined {
    return this.configService.get('RESEND_FROM_EMAIL');
  }

  get<T extends keyof Env>(key: T): Env[T] {
    return this.configService.get(key, { infer: true });
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
