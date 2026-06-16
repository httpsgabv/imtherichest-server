import { APIError } from 'better-auth/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '#lib/auth.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { EmailAlreadyInUserError } from '#domain/auth/errors/email-already-in-use.error.js';
import { BetterAuthIdentityProvider } from './better-auth-identity.provider.js';

vi.mock('#lib/auth.js', () => ({
  auth: {
    api: {
      signUpEmail: vi.fn(),
    },
  },
}));

const signUpEmailMock = vi.mocked(auth.api.signUpEmail);

const apiUser = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: 'John Doe',
  email: 'john@example.com',
  emailVerified: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

const defaultParams = {
  name: apiUser.name,
  email: apiUser.email,
  password: '12345678',
};

function makeHeaders(cookies: string[] = ['session=abc; HttpOnly; Path=/']) {
  return { getSetCookie: () => cookies };
}

function mockSuccess(cookies?: string[]) {
  signUpEmailMock.mockResolvedValue({
    headers: makeHeaders(cookies),
    response: { user: apiUser },
  } as any);
}

describe('BetterAuthIdentityProvider', () => {
  let sut: BetterAuthIdentityProvider;

  beforeEach(() => {
    sut = new BetterAuthIdentityProvider();
    vi.clearAllMocks();
  });

  it('should return success when the auth provider responds successfully', async () => {
    mockSuccess();

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isSuccess()).toBe(true);
  });

  it('should map the API user fields to the User entity', async () => {
    mockSuccess();

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(result.value.user.id.toString()).toBe(apiUser.id);
    expect(result.value.user.name).toBe(apiUser.name);
    expect(result.value.user.email).toBe(apiUser.email);
    expect(result.value.user.emailVerified).toBe(apiUser.emailVerified);
    expect(result.value.user.createdAt).toBe(apiUser.createdAt);
  });

  it('should return the cookie headers from the auth provider response', async () => {
    const cookies = [
      'session=abc; HttpOnly; Path=/',
      'csrf=xyz; SameSite=Strict',
    ];
    mockSuccess(cookies);

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(result.value.setCookieHeaders).toEqual(cookies);
  });

  it('should return failure with EmailAlreadyInUserError when the API returns 422 for duplicate email', async () => {
    signUpEmailMock.mockRejectedValue(
      APIError.from('UNPROCESSABLE_ENTITY', {
        message: 'User already exists. Use another email.',
        code: '',
      }),
    );

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyInUserError);
    expect((result.value as EmailAlreadyInUserError).message).toBe(
      `Email ${defaultParams.email} is already in use.`,
    );
  });

  it('should return failure with EmailAlreadyInUserError when the API returns 409', async () => {
    signUpEmailMock.mockRejectedValue(
      new APIError(409, { message: 'Conflict' }),
    );

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyInUserError);
  });

  it('should return failure with AuthProviderError when the API returns a non-409 error', async () => {
    signUpEmailMock.mockRejectedValue(
      new APIError(500, { message: 'Internal server error' }),
    );

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Internal server error',
    );
  });

  it('should return failure with AuthProviderError using the original message when a regular Error is thrown', async () => {
    const originalError = new Error('Connection refused');
    signUpEmailMock.mockRejectedValue(originalError);

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Connection refused',
    );
    expect((result.value as AuthProviderError).cause).toBe(originalError);
  });

  it('should return failure with a generic message when a non-Error value is thrown', async () => {
    signUpEmailMock.mockRejectedValue('something unexpected');

    const result = await sut.signUpWithEmail(defaultParams);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Unexpected auth provider error.',
    );
  });
});
