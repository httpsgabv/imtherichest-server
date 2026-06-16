import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { FakeAuthIdentityProvider } from '#test/auth/fake-auth-identity-provider.js';
import { SignOutUseCase } from './sign-out.use-case.js';

const fakeHeaders = { cookie: 'better-auth.session_token=abc123' };

describe('SignOutUseCase', () => {
  let fakeProvider: FakeAuthIdentityProvider;
  let sut: SignOutUseCase;

  beforeEach(() => {
    fakeProvider = new FakeAuthIdentityProvider();
    sut = new SignOutUseCase(fakeProvider);
  });

  it('should return success with cookie headers when provider succeeds', async () => {
    const result = await sut.execute({ headers: fakeHeaders });

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toMatchObject({
      setCookieHeaders: expect.any(Array),
    });
  });

  it('should forward the correct params to the identity provider', async () => {
    await sut.execute({ headers: fakeHeaders });

    expect(fakeProvider.lastReceivedParams).toEqual({ headers: fakeHeaders });
  });

  it('should return failure with AuthProviderError when the provider fails', async () => {
    fakeProvider.simulateSignOutResult(
      failure(new AuthProviderError('Upstream unavailable.')),
    );

    const result = await sut.execute({ headers: fakeHeaders });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Upstream unavailable.',
    );
  });

  it('should propagate the exact error instance without re-wrapping', async () => {
    const error = new AuthProviderError('raw error');
    fakeProvider.simulateSignOutResult(failure(error));

    const result = await sut.execute({ headers: fakeHeaders });

    expect(result.value).toBe(error);
  });

  it('should include the Set-Cookie headers returned by the provider', async () => {
    fakeProvider.simulateSignOutResult(
      success({ setCookieHeaders: ['session=; Max-Age=0; HttpOnly'] }),
    );

    const result = await sut.execute({ headers: fakeHeaders });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).setCookieHeaders).toEqual([
      'session=; Max-Age=0; HttpOnly',
    ]);
  });
});
