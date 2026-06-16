import type { Either } from '#core/utils/either.js';
import type { AuthProviderError } from '../errors/auth-provider.error.js';
import type { EmailAlreadyInUserError } from '../errors/email-already-in-use.error.js';
import type { InvalidCredentialsError } from '../errors/invalid-credentials.error.js';
import type { InvalidPasswordError } from '../errors/invalid-password.error.js';
import type { SessionNotFoundError } from '../errors/session-not-found.error.js';
import type {
  SignUpWithEmailUseCaseRequest,
  SignUpWithEmailUseCaseResponse,
} from '../use-cases/sign-up-with-email.use-case.js';
import type {
  SignInWithEmailUseCaseRequest,
  SignInWithEmailUseCaseResponse,
} from '../use-cases/sign-in-with-email.use-case.js';
import type {
  GetSessionUseCaseRequest,
  GetSessionUseCaseResponse,
} from '../use-cases/get-session.use-case.js';
import type {
  SignOutUseCaseRequest,
  SignOutUseCaseResponse,
} from '../use-cases/sign-out.use-case.js';
import type {
  RequestPasswordResetUseCaseRequest,
  RequestPasswordResetUseCaseResponse,
} from '../use-cases/request-password-reset.use-case.js';
import type {
  UpdatePasswordUseCaseRequest,
  UpdatePasswordUseCaseResponse,
} from '../use-cases/update-password.use-case.js';

export type AuthIdentityProviderSignUpResult = Either<
  AuthProviderError | EmailAlreadyInUserError,
  SignUpWithEmailUseCaseResponse
>;

export type AuthIdentityProviderSignInResult = Either<
  AuthProviderError | InvalidCredentialsError,
  SignInWithEmailUseCaseResponse
>;

export type AuthIdentityProviderGetSessionResult = Either<
  AuthProviderError | SessionNotFoundError,
  GetSessionUseCaseResponse
>;

export type AuthIdentityProviderSignOutResult = Either<
  AuthProviderError,
  SignOutUseCaseResponse
>;

export type AuthIdentityProviderRequestPasswordResetResult = Either<
  AuthProviderError,
  RequestPasswordResetUseCaseResponse
>;

export type AuthIdentityProviderUpdatePasswordResult = Either<
  InvalidPasswordError | AuthProviderError,
  UpdatePasswordUseCaseResponse
>;

export abstract class AuthIdentityProvider {
  abstract signUpWithEmail(
    params: SignUpWithEmailUseCaseRequest,
  ): Promise<AuthIdentityProviderSignUpResult>;

  abstract signInWithEmail(
    params: SignInWithEmailUseCaseRequest,
  ): Promise<AuthIdentityProviderSignInResult>;

  abstract getSession(
    params: GetSessionUseCaseRequest,
  ): Promise<AuthIdentityProviderGetSessionResult>;

  abstract signOut(
    params: SignOutUseCaseRequest,
  ): Promise<AuthIdentityProviderSignOutResult>;

  abstract requestPasswordReset(
    params: RequestPasswordResetUseCaseRequest,
  ): Promise<AuthIdentityProviderRequestPasswordResetResult>;

  abstract updatePassword(
    params: UpdatePasswordUseCaseRequest,
  ): Promise<AuthIdentityProviderUpdatePasswordResult>;
}
