import { DomainError } from '#core/errors/domain.error.js';

export class InvalidPasswordError extends DomainError {
  readonly code = 'INVALID_PASSWORD' as const;

  constructor() {
    super('Current password is incorrect.');
  }
}
