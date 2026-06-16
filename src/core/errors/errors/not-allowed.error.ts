import { UseCaseError } from '#core/errors/use-case.error.js';

export class NotAllowedError extends Error implements UseCaseError {
  constructor() {
    super(`Action not allowed`);
  }
}
