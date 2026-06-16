import { UseCase } from '#core/use-cases/use-case.js';
import { Injectable } from '@nestjs/common';
import { AuthIdentityProvider } from '../ports/auth-identity.provider.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { AuthProviderError } from '../errors/auth-provider.error.js';
import type { InvalidPasswordError } from '../errors/invalid-password.error.js';

export type UpdatePasswordUseCaseRequest = {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
  headers: Record<string, string | string[] | undefined>;
};

export type UpdatePasswordUseCaseResponse = {
  setCookieHeaders: string[];
};

export type UpdatePasswordUseCaseResult = Either<
  InvalidPasswordError | AuthProviderError,
  UpdatePasswordUseCaseResponse
>;

@Injectable()
export class UpdatePasswordUseCase implements UseCase<
  UpdatePasswordUseCaseRequest,
  UpdatePasswordUseCaseResult
> {
  constructor(private readonly authIdentityProvider: AuthIdentityProvider) {}

  async execute(
    params: UpdatePasswordUseCaseRequest,
  ): Promise<UpdatePasswordUseCaseResult> {
    const result = await this.authIdentityProvider.updatePassword(params);

    if (result.isFailure()) {
      return failure(result.value);
    }

    return success(result.value);
  }
}
