import { DomainError } from '#core/errors/domain.error.js';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS' as const;

  constructor() {
    super('Invalid email or password.');
  }
}
