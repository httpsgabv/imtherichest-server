import { DomainError } from '#core/errors/domain.error.js';

export class UsernameAlreadyTakenError extends DomainError {
  readonly code = 'USERNAME_ALREADY_TAKEN' as const;

  constructor(username: string) {
    super(`Username "${username}" is already taken.`);
  }
}
