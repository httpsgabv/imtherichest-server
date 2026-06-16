import { UseCase } from '#core/use-cases/use-case.js';
import { Injectable } from '@nestjs/common';
import { AuthIdentityProvider } from '../ports/auth-identity.provider.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { AuthProviderError } from '../errors/auth-provider.error.js';

export type SignOutUseCaseRequest = {
  headers: Record<string, string | string[] | undefined>;
};

export type SignOutUseCaseResponse = {
  setCookieHeaders: string[];
};

export type SignOutUseCaseResult = Either<
  AuthProviderError,
  SignOutUseCaseResponse
>;

@Injectable()
export class SignOutUseCase implements UseCase<
  SignOutUseCaseRequest,
  SignOutUseCaseResult
> {
  constructor(private readonly authIdentityProvider: AuthIdentityProvider) {}

  async execute(params: SignOutUseCaseRequest): Promise<SignOutUseCaseResult> {
    const result = await this.authIdentityProvider.signOut(params);

    if (result.isFailure()) {
      return failure(result.value);
    }

    return success(result.value);
  }
}
