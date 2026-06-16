import { UseCase } from '#core/use-cases/use-case.js';
import { Injectable } from '@nestjs/common';
import { AuthIdentityProvider } from '../ports/auth-identity.provider.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { AuthProviderError } from '../errors/auth-provider.error.js';

export type RequestPasswordResetUseCaseRequest = {
  email: string;
  redirectTo?: string;
};

export type RequestPasswordResetUseCaseResponse = Record<string, never>;

export type RequestPasswordResetUseCaseResult = Either<
  AuthProviderError,
  RequestPasswordResetUseCaseResponse
>;

@Injectable()
export class RequestPasswordResetUseCase implements UseCase<
  RequestPasswordResetUseCaseRequest,
  RequestPasswordResetUseCaseResult
> {
  constructor(private readonly authIdentityProvider: AuthIdentityProvider) {}

  async execute(
    params: RequestPasswordResetUseCaseRequest,
  ): Promise<RequestPasswordResetUseCaseResult> {
    const result = await this.authIdentityProvider.requestPasswordReset(params);

    if (result.isFailure()) {
      return failure(result.value);
    }

    return success(result.value);
  }
}
