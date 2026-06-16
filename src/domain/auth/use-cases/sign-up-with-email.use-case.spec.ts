import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { EmailAlreadyInUserError } from '#domain/auth/errors/email-already-in-use.error.js';
import { FakeAuthIdentityProvider } from '#test/auth/fake-auth-identity-provider.js';
import { makeUser } from '#test/factories/make-user.js';
import { SignUpWithEmailUseCase } from './sign-up-with-email.use-case.js';

describe('SignUpWithEmailUseCase', () => {
  let fakeProvider: FakeAuthIdentityProvider;
  let sut: SignUpWithEmailUseCase;

  beforeEach(() => {
    fakeProvider = new FakeAuthIdentityProvider();
    sut = new SignUpWithEmailUseCase(fakeProvider);
  });

  it('should return success with user and cookie headers when provider succeeds', async () => {
    const result = await sut.execute({
      name: 'John Doe',
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
      name: 'John Doe',
      email: 'john@example.com',
      password: '12345678',
    };

    await sut.execute(params);

    expect(fakeProvider.lastReceivedParams).toEqual(params);
  });

  it('should return failure with EmailAlreadyInUserError when email is already in use', async () => {
    fakeProvider.simulateEmailAlreadyInUse('john@example.com');

    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: '12345678',
    });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyInUserError);
    expect((result.value as EmailAlreadyInUserError).message).toBe(
      'Email john@example.com is already in use.',
    );
  });

  it('should return failure with AuthProviderError when provider returns an error', async () => {
    fakeProvider.simulateProviderError('Upstream service unavailable.');

    const result = await sut.execute({
      name: 'John Doe',
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
    const error = new EmailAlreadyInUserError('john@example.com');
    fakeProvider.simulateResult(failure(error));

    const result = await sut.execute({
      name: 'John Doe',
      email: 'john@example.com',
      password: '12345678',
    });

    expect(result.value).toBe(error);
  });

  it('should include the cookie headers returned by the provider in the success result', async () => {
    const user = makeUser();
    fakeProvider.simulateResult(
      success({
        user,
        setCookieHeaders: ['session=abc; HttpOnly', 'csrf=xyz'],
      }),
    );

    const result = await sut.execute({
      name: user.name,
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
