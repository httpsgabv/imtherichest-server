import { DomainError } from '#core/errors/domain.error.js';

export class EmailAlreadyInUserError extends DomainError {
  readonly code = 'EMAIL_ALREADY_IN_USE' as const;

  constructor(email: string) {
    super(`Email ${email} is already in use.`);
  }
}
