import { UseCase } from '#core/use-cases/use-case.js';
import { Injectable } from '@nestjs/common';
import type { User } from '#domain/users/entities/user.js';
import { AuthIdentityProvider } from '../ports/auth-identity.provider.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { SessionNotFoundError } from '../errors/session-not-found.error.js';
import type { AuthProviderError } from '../errors/auth-provider.error.js';

export type GetSessionUseCaseRequest = {
  headers: Record<string, string | string[] | undefined>;
};

export type GetSessionUseCaseResponse = {
  user: User;
  session: {
    id: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null | undefined;
    userAgent: string | null | undefined;
  };
};

export type GetSessionUseCaseResult = Either<
  SessionNotFoundError | AuthProviderError,
  GetSessionUseCaseResponse
>;

@Injectable()
export class GetSessionUseCase implements UseCase<
  GetSessionUseCaseRequest,
  GetSessionUseCaseResult
> {
  constructor(private readonly authIdentityProvider: AuthIdentityProvider) {}

  async execute(
    params: GetSessionUseCaseRequest,
  ): Promise<GetSessionUseCaseResult> {
    const result = await this.authIdentityProvider.getSession(params);

    if (result.isFailure()) {
      return failure(result.value);
    }

    return success(result.value);
  }
}
