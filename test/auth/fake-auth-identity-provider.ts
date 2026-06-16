import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { EmailAlreadyInUserError } from '#domain/auth/errors/email-already-in-use.error.js';
import { InvalidCredentialsError } from '#domain/auth/errors/invalid-credentials.error.js';
import { InvalidPasswordError } from '#domain/auth/errors/invalid-password.error.js';
import { SessionNotFoundError } from '#domain/auth/errors/session-not-found.error.js';
import type {
  AuthIdentityProviderGetSessionResult,
  AuthIdentityProviderRequestPasswordResetResult,
  AuthIdentityProviderSignInResult,
  AuthIdentityProviderSignOutResult,
  AuthIdentityProviderSignUpResult,
  AuthIdentityProviderUpdatePasswordResult,
} from '#domain/auth/ports/auth-identity.provider.js';
import { AuthIdentityProvider } from '#domain/auth/ports/auth-identity.provider.js';
import type { SignUpWithEmailUseCaseRequest } from '#domain/auth/use-cases/sign-up-with-email.use-case.js';
import type { SignInWithEmailUseCaseRequest } from '#domain/auth/use-cases/sign-in-with-email.use-case.js';
import type { GetSessionUseCaseRequest } from '#domain/auth/use-cases/get-session.use-case.js';
import type { SignOutUseCaseRequest } from '#domain/auth/use-cases/sign-out.use-case.js';
import type { RequestPasswordResetUseCaseRequest } from '#domain/auth/use-cases/request-password-reset.use-case.js';
import type { UpdatePasswordUseCaseRequest } from '#domain/auth/use-cases/update-password.use-case.js';
import { makeUser } from '../factories/make-user.js';

export class FakeAuthIdentityProvider extends AuthIdentityProvider {
  lastReceivedParams:
    | SignUpWithEmailUseCaseRequest
    | SignInWithEmailUseCaseRequest
    | GetSessionUseCaseRequest
    | SignOutUseCaseRequest
    | RequestPasswordResetUseCaseRequest
    | UpdatePasswordUseCaseRequest
    | undefined;

  private _signUpResult: AuthIdentityProviderSignUpResult = success({
    user: makeUser(),
    setCookieHeaders: [],
  });

  private _signInResult: AuthIdentityProviderSignInResult = success({
    user: makeUser(),
    setCookieHeaders: [],
  });

  private _getSessionResult: AuthIdentityProviderGetSessionResult = success({
    user: makeUser(),
    session: {
      id: 'fake-session-id',
      expiresAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ipAddress: null,
      userAgent: null,
    },
  });

  private _signOutResult: AuthIdentityProviderSignOutResult = success({
    setCookieHeaders: [],
  });

  private _requestPasswordResetResult: AuthIdentityProviderRequestPasswordResetResult =
    success({});

  private _updatePasswordResult: AuthIdentityProviderUpdatePasswordResult =
    success({ setCookieHeaders: [] });

  simulateEmailAlreadyInUse(email: string): void {
    this._signUpResult = failure(new EmailAlreadyInUserError(email));
  }

  simulateProviderError(message: string): void {
    this._signUpResult = failure(new AuthProviderError(message));
    this._signInResult = failure(new AuthProviderError(message));
    this._getSessionResult = failure(new AuthProviderError(message));
    this._signOutResult = failure(new AuthProviderError(message));
    this._requestPasswordResetResult = failure(new AuthProviderError(message));
    this._updatePasswordResult = failure(new AuthProviderError(message));
  }

  simulateInvalidPassword(): void {
    this._updatePasswordResult = failure(new InvalidPasswordError());
  }

  simulateUpdatePasswordResult(
    result: AuthIdentityProviderUpdatePasswordResult,
  ): void {
    this._updatePasswordResult = result;
  }

  simulateRequestPasswordResetResult(
    result: AuthIdentityProviderRequestPasswordResetResult,
  ): void {
    this._requestPasswordResetResult = result;
  }

  simulateSignOutResult(result: AuthIdentityProviderSignOutResult): void {
    this._signOutResult = result;
  }

  simulateSessionNotFound(): void {
    this._getSessionResult = failure(new SessionNotFoundError());
  }

  simulateGetSessionResult(result: AuthIdentityProviderGetSessionResult): void {
    this._getSessionResult = result;
  }

  simulateResult(result: AuthIdentityProviderSignUpResult): void {
    this._signUpResult = result;
  }

  simulateInvalidCredentials(): void {
    this._signInResult = failure(new InvalidCredentialsError());
  }

  simulateSignInProviderError(message: string): void {
    this._signInResult = failure(new AuthProviderError(message));
  }

  simulateSignInResult(result: AuthIdentityProviderSignInResult): void {
    this._signInResult = result;
  }

  async signUpWithEmail(
    params: SignUpWithEmailUseCaseRequest,
  ): Promise<AuthIdentityProviderSignUpResult> {
    this.lastReceivedParams = params;
    return this._signUpResult;
  }

  async signInWithEmail(
    params: SignInWithEmailUseCaseRequest,
  ): Promise<AuthIdentityProviderSignInResult> {
    this.lastReceivedParams = params;
    return this._signInResult;
  }

  async getSession(
    params: GetSessionUseCaseRequest,
  ): Promise<AuthIdentityProviderGetSessionResult> {
    this.lastReceivedParams = params;
    return this._getSessionResult;
  }

  async signOut(
    params: SignOutUseCaseRequest,
  ): Promise<AuthIdentityProviderSignOutResult> {
    this.lastReceivedParams = params;
    return this._signOutResult;
  }

  async requestPasswordReset(
    params: RequestPasswordResetUseCaseRequest,
  ): Promise<AuthIdentityProviderRequestPasswordResetResult> {
    this.lastReceivedParams = params;
    return this._requestPasswordResetResult;
  }

  async updatePassword(
    params: UpdatePasswordUseCaseRequest,
  ): Promise<AuthIdentityProviderUpdatePasswordResult> {
    this.lastReceivedParams = params;
    return this._updatePasswordResult;
  }
}
