import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { InvalidCredentialsError } from '#domain/auth/errors/invalid-credentials.error.js';
import { FakeAuthIdentityProvider } from '#test/auth/fake-auth-identity-provider.js';
import { makeUser } from '#test/factories/make-user.js';
import { SignInWithEmailUseCase } from './sign-in-with-email.use-case.js';

describe('SignInWithEmailUseCase', () => {
  let fakeProvider: FakeAuthIdentityProvider;
  let sut: SignInWithEmailUseCase;

  beforeEach(() => {
    fakeProvider = new FakeAuthIdentityProvider();
    sut = new SignInWithEmailUseCase(fakeProvider);
  });

  it('should return success with user and cookie headers when provider succeeds', async () => {
    const result = await sut.execute({
      email: 'john@example.com',
      password: '12345678',
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toMatchObject({
      user: expect.any(Object),
      setCookieHeaders: expect.any(Array),
    });
  });

  it('should forward the correct params to the identity provider', async () => {
    const params = {
      email: 'john@example.com',
      password: '12345678',
    };

    await sut.execute(params);

    expect(fakeProvider.lastReceivedParams).toEqual(params);
  });

  it('should return failure with InvalidCredentialsError when credentials are wrong', async () => {
    fakeProvider.simulateInvalidCredentials();

    const result = await sut.execute({
      email: 'john@example.com',
      password: 'wrongpassword',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidCredentialsError);
    expect((result.value as InvalidCredentialsError).message).toBe(
      'Invalid email or password.',
    );
  });

  it('should return failure with AuthProviderError when provider returns an error', async () => {
    fakeProvider.simulateSignInProviderError('Upstream service unavailable.');

    const result = await sut.execute({
      email: 'john@example.com',
      password: '12345678',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Upstream service unavailable.',
    );
  });

  it('should propagate the exact error instance without re-wrapping', async () => {
    const error = new InvalidCredentialsError();
    fakeProvider.simulateSignInResult(failure(error));

    const result = await sut.execute({
      email: 'john@example.com',
      password: 'wrongpassword',
    });

    expect(result.value).toBe(error);
  });

  it('should include the cookie headers returned by the provider in the success result', async () => {
    const user = makeUser();
    fakeProvider.simulateSignInResult(
      success({
        user,
        setCookieHeaders: ['session=abc; HttpOnly', 'csrf=xyz'],
      }),
    );

    const result = await sut.execute({
      email: user.email,
      password: '12345678',
    });

    expect(result.isSuccess()).toBe(true);
    expect((result.value as any).setCookieHeaders).toEqual([
      'session=abc; HttpOnly',
      'csrf=xyz',
    ]);
  });
});
