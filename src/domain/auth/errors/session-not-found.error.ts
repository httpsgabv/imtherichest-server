import { DomainError } from '#core/errors/domain.error.js';

export class SessionNotFoundError extends DomainError {
  readonly code = 'SESSION_NOT_FOUND' as const;

  constructor() {
    super('Session not found or expired.');
  }
}
