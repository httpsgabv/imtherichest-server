import { DomainError } from '#core/errors/domain.error.js';

export class InvalidAmountError extends DomainError {
  readonly code = 'INVALID_AMOUNT' as const;

  constructor() {
    super('Amount must be a positive integer of at least 100 cents ($1.00).');
  }
}
