import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { failure, success } from '#core/utils/either.js';
import { auth } from '#lib/auth.js';
import { isAPIError } from 'better-auth/api';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { EmailAlreadyInUserError } from '#domain/auth/errors/email-already-in-use.error.js';
import { InvalidCredentialsError } from '#domain/auth/errors/invalid-credentials.error.js';
import { InvalidPasswordError } from '#domain/auth/errors/invalid-password.error.js';
import { SessionNotFoundError } from '#domain/auth/errors/session-not-found.error.js';
import {
  AuthIdentityProvider,
  AuthIdentityProviderGetSessionResult,
  AuthIdentityProviderRequestPasswordResetResult,
  AuthIdentityProviderSignInResult,
  AuthIdentityProviderSignOutResult,
  AuthIdentityProviderSignUpResult,
  AuthIdentityProviderUpdatePasswordResult,
} from '#domain/auth/ports/auth-identity.provider.js';
import { SignUpWithEmailUseCaseRequest } from '#domain/auth/use-cases/sign-up-with-email.use-case.js';
import { SignInWithEmailUseCaseRequest } from '#domain/auth/use-cases/sign-in-with-email.use-case.js';
import { GetSessionUseCaseRequest } from '#domain/auth/use-cases/get-session.use-case.js';
import { SignOutUseCaseRequest } from '#domain/auth/use-cases/sign-out.use-case.js';
import { RequestPasswordResetUseCaseRequest } from '#domain/auth/use-cases/request-password-reset.use-case.js';
import { UpdatePasswordUseCaseRequest } from '#domain/auth/use-cases/update-password.use-case.js';
import { User } from '#domain/users/entities/user.js';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BetterAuthIdentityProvider implements AuthIdentityProvider {
  async signUpWithEmail(
    params: SignUpWithEmailUseCaseRequest,
  ): Promise<AuthIdentityProviderSignUpResult> {
    try {
      const { headers, response } = await auth.api.signUpEmail({
        returnHeaders: true,
        body: {
          name: params.username,
          email: params.email,
          password: params.password,
        },
      });

      const { id, name, email, emailVerified, createdAt } = response.user;

      const user = User.create(
        {
          name,
          email,
          emailVerified,
          createdAt,
        },
        new UniqueEntityID(id),
      );

      return success({
        user,
        setCookieHeaders: headers.getSetCookie(),
      });
    } catch (error) {
      if (isAPIError(error)) {
        const isDuplicateEmail =
          error.statusCode === 409 ||
          (error.statusCode === 422 &&
            error.message.includes('already exists'));

        if (isDuplicateEmail) {
          return failure(new EmailAlreadyInUserError(params.email));
        }

        return failure(new AuthProviderError(error.message));
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected auth provider error.';

      return failure(new AuthProviderError(message, { cause: error }));
    }
  }

  async signInWithEmail(
    params: SignInWithEmailUseCaseRequest,
  ): Promise<AuthIdentityProviderSignInResult> {
    try {
      const { headers, response } = await auth.api.signInEmail({
        returnHeaders: true,
        body: {
          email: params.email,
          password: params.password,
        },
      });

      const { id, name, email, emailVerified, createdAt } = response.user;

      const user = User.create(
        {
          name,
          email,
          emailVerified,
          createdAt,
        },
        new UniqueEntityID(id),
      );

      return success({
        user,
        setCookieHeaders: headers.getSetCookie(),
      });
    } catch (error) {
      if (isAPIError(error)) {
        if (error.statusCode === 401 || error.statusCode === 403) {
          return failure(new InvalidCredentialsError());
        }

        return failure(new AuthProviderError(error.message));
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected auth provider error.';

      return failure(new AuthProviderError(message, { cause: error }));
    }
  }

  async getSession(
    params: GetSessionUseCaseRequest,
  ): Promise<AuthIdentityProviderGetSessionResult> {
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(params.headers)) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else if (value !== undefined) {
          headers.set(key, value);
        }
      }

      const data = await auth.api.getSession({ headers });

      if (!data) {
        return failure(new SessionNotFoundError());
      }

      const { id, name, email, emailVerified, createdAt } = data.user;

      const user = User.create(
        { name, email, emailVerified, createdAt },
        new UniqueEntityID(id),
      );

      return success({
        user,
        session: {
          id: data.session.id,
          expiresAt: data.session.expiresAt,
          createdAt: data.session.createdAt,
          updatedAt: data.session.updatedAt,
          ipAddress: data.session.ipAddress,
          userAgent: data.session.userAgent,
        },
      });
    } catch (error) {
      if (isAPIError(error)) {
        return failure(new AuthProviderError(error.message));
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected auth provider error.';

      return failure(new AuthProviderError(message, { cause: error }));
    }
  }

  async signOut(
    params: SignOutUseCaseRequest,
  ): Promise<AuthIdentityProviderSignOutResult> {
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(params.headers)) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else if (value !== undefined) {
          headers.set(key, value);
        }
      }

      const { headers: responseHeaders } = await auth.api.signOut({
        returnHeaders: true,
        headers,
      });

      return success({ setCookieHeaders: responseHeaders.getSetCookie() });
    } catch (error) {
      if (isAPIError(error)) {
        return failure(new AuthProviderError(error.message));
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected auth provider error.';

      return failure(new AuthProviderError(message, { cause: error }));
    }
  }

  async requestPasswordReset(
    params: RequestPasswordResetUseCaseRequest,
  ): Promise<AuthIdentityProviderRequestPasswordResetResult> {
    try {
      await auth.api.requestPasswordReset({
        body: {
          email: params.email,
          redirectTo: params.redirectTo ?? '/',
        },
      });

      return success({});
    } catch (error) {
      if (isAPIError(error)) {
        return failure(new AuthProviderError(error.message));
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected auth provider error.';

      return failure(new AuthProviderError(message, { cause: error }));
    }
  }

  async updatePassword(
    params: UpdatePasswordUseCaseRequest,
  ): Promise<AuthIdentityProviderUpdatePasswordResult> {
    try {
      const headers = new Headers();
      for (const [key, value] of Object.entries(params.headers)) {
        if (Array.isArray(value)) {
          for (const v of value) headers.append(key, v);
        } else if (value !== undefined) {
          headers.set(key, value);
        }
      }

      const { headers: responseHeaders } = await auth.api.changePassword({
        returnHeaders: true,
        body: {
          currentPassword: params.currentPassword,
          newPassword: params.newPassword,
          revokeOtherSessions: params.revokeOtherSessions ?? false,
        },
        headers,
      });

      return success({ setCookieHeaders: responseHeaders.getSetCookie() });
    } catch (error) {
      if (isAPIError(error)) {
        const isInvalidPassword =
          error.statusCode === 401 ||
          error.statusCode === 403 ||
          (error.statusCode === 400 && error.message === 'Invalid password');

        if (isInvalidPassword) {
          return failure(new InvalidPasswordError());
        }

        return failure(new AuthProviderError(error.message));
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Unexpected auth provider error.';

      return failure(new AuthProviderError(message, { cause: error }));
    }
  }
}
