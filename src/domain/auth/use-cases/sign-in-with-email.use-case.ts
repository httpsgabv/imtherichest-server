import { UseCase } from '#core/use-cases/use-case.js';
import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/users/entities/user.js';
import { AuthIdentityProvider } from '../ports/auth-identity.provider.js';
import { failure, success, type Either } from '#core/utils/either.js';
import { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import { AuthProviderError } from '../errors/auth-provider.error.js';

export type SignInWithEmailUseCaseRequest = {
  email: string;
  password: string;
};

export type SignInWithEmailUseCaseResponse = {
  user: User;
  setCookieHeaders: string[];
};

export type SignInWithEmailUseCaseResult = Either<
  InvalidCredentialsError | AuthProviderError,
  SignInWithEmailUseCaseResponse
>;

@Injectable()
export class SignInWithEmailUseCase implements UseCase<
  SignInWithEmailUseCaseRequest,
  SignInWithEmailUseCaseResult
> {
  constructor(private readonly authIdentityProvider: AuthIdentityProvider) {}

  async execute(
    params: SignInWithEmailUseCaseRequest,
  ): Promise<SignInWithEmailUseCaseResult> {
    const result = await this.authIdentityProvider.signInWithEmail(params);

    if (result.isFailure()) {
      return failure(result.value);
    }

    return success(result.value);
  }
}
