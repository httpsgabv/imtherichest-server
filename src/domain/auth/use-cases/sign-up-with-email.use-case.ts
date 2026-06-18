import { UseCase } from '#core/use-cases/use-case.js';
import { Injectable } from '@nestjs/common';
import { User } from 'src/domain/users/entities/user.js';
import { AuthIdentityProvider } from '../ports/auth-identity.provider.js';
import { failure, success, type Either } from '#core/utils/either.js';
import { EmailAlreadyInUserError } from '../errors/email-already-in-use.error.js';
import { AuthProviderError } from '../errors/auth-provider.error.js';
import { CreateProfileUseCase } from '#domain/users/use-cases/create-profile.use-case.js';
import { UsernameAlreadyTakenError } from '#domain/users/errors/username-already-taken.error.js';

export type SignUpWithEmailUseCaseRequest = {
  email: string;
  password: string;
  username: string;
};

export type SignUpWithEmailUseCaseResponse = {
  user: User;
  setCookieHeaders: string[];
};

export type SignUpWithEmailUseCaseResult = Either<
  EmailAlreadyInUserError | AuthProviderError | UsernameAlreadyTakenError,
  SignUpWithEmailUseCaseResponse
>;

@Injectable()
export class SignUpWithEmailUseCase implements UseCase<
  SignUpWithEmailUseCaseRequest,
  SignUpWithEmailUseCaseResult
> {
  constructor(
    private readonly authIdentityProvider: AuthIdentityProvider,
    private readonly createProfileUseCase: CreateProfileUseCase,
  ) {}

  async execute(
    params: SignUpWithEmailUseCaseRequest,
  ): Promise<SignUpWithEmailUseCaseResult> {
    const result = await this.authIdentityProvider.signUpWithEmail(params);

    if (result.isFailure()) {
      return failure(result.value);
    }

    const profileResult = await this.createProfileUseCase.execute({
      userId: result.value.user.id,
      username: params.username,
      displayName: params.username,
    });

    if (profileResult.isFailure()) {
      return failure(profileResult.value);
    }

    return success(result.value);
  }
}
