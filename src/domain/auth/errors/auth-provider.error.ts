import { DomainError } from '#core/errors/domain.error.js';

export class AuthProviderError extends DomainError {
  readonly code = 'AUTH_PROVIDER_ERROR' as const;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
