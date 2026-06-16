import type { Env } from '#infra/env/env.js';

export abstract class IEnvService {
  abstract get<T extends keyof Env>(key: T): Env[T];
  abstract getCorsOrigins(): string[];
  abstract isProduction(): boolean;
  abstract isDevelopment(): boolean;
}
