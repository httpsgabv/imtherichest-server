import { UseCase } from '#core/use-cases/use-case.js';
import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/users/entities/user.js';
import { AuthIdentityProvider } from '../ports/auth-identity.provider.js';
import { failure, success, type Either } from '#core/utils/either.js';
import { EmailAlreadyInUserError } from '../errors/email-already-in-use.error.js';
import { AuthProviderError } from '../errors/auth-provider.error.js';

export type SignUpWithEmailUseCaseRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignUpWithEmailUseCaseResponse = {
  user: User;
  setCookieHeaders: string[];
};

export type SignUpWithEmailUseCaseResult = Either<
  EmailAlreadyInUserError | AuthProviderError,
  SignUpWithEmailUseCaseResponse
>;

@Injectable()
export class SignUpWithEmailUseCase implements UseCase<
  SignUpWithEmailUseCaseRequest,
  SignUpWithEmailUseCaseResult
> {
  constructor(private readonly authIdentityProvider: AuthIdentityProvider) {}

  async execute(
    params: SignUpWithEmailUseCaseRequest,
  ): Promise<SignUpWithEmailUseCaseResult> {
    const result = await this.authIdentityProvider.signUpWithEmail(params);

    if (result.isFailure()) {
      return failure(result.value);
    }

    return success(result.value);
  }
}
