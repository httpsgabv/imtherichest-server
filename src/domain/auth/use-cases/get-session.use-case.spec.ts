import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { SessionNotFoundError } from '#domain/auth/errors/session-not-found.error.js';
import { FakeAuthIdentityProvider } from '#test/auth/fake-auth-identity-provider.js';
import { makeUser } from '#test/factories/make-user.js';
import { GetSessionUseCase } from './get-session.use-case.js';

describe('GetSessionUseCase', () => {
  let fakeProvider: FakeAuthIdentityProvider;
  let sut: GetSessionUseCase;

  beforeEach(() => {
    fakeProvider = new FakeAuthIdentityProvider();
    sut = new GetSessionUseCase(fakeProvider);
  });

  const fakeHeaders = { cookie: 'session=abc' };

  it('should return success with user and session when provider succeeds', async () => {
    const result = await sut.execute({ headers: fakeHeaders });

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toMatchObject({
      user: expect.any(Object),
      session: expect.any(Object),
    });
  });

  it('should forward the correct params to the identity provider', async () => {
    const params = { headers: fakeHeaders };

    await sut.execute(params);

    expect(fakeProvider.lastReceivedParams).toEqual(params);
  });

  it('should return failure with SessionNotFoundError when session is not found', async () => {
    fakeProvider.simulateSessionNotFound();

    const result = await sut.execute({ headers: {} });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(SessionNotFoundError);
    expect((result.value as SessionNotFoundError).message).toBe(
      'Session not found or expired.',
    );
  });

  it('should return failure with AuthProviderError when provider returns an error', async () => {
    fakeProvider.simulateProviderError('Upstream service unavailable.');

    const result = await sut.execute({ headers: fakeHeaders });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Upstream service unavailable.',
    );
  });

  it('should propagate the exact error instance without re-wrapping', async () => {
    const error = new SessionNotFoundError();
    fakeProvider.simulateGetSessionResult(failure(error));

    const result = await sut.execute({ headers: {} });

    expect(result.value).toBe(error);
  });

  it('should include the session data returned by the provider in the success result', async () => {
    const user = makeUser();
    const sessionData = {
      id: 'session-123',
      expiresAt: new Date('2030-01-01'),
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    };
    fakeProvider.simulateGetSessionResult(
      success({ user, session: sessionData }),
    );

    const result = await sut.execute({ headers: fakeHeaders });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).session).toEqual(sessionData);
  });
});
