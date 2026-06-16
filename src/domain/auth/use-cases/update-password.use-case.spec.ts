import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { InvalidPasswordError } from '#domain/auth/errors/invalid-password.error.js';
import { FakeAuthIdentityProvider } from '#test/auth/fake-auth-identity-provider.js';
import { UpdatePasswordUseCase } from './update-password.use-case.js';

const fakeParams = {
  currentPassword: 'old-password',
  newPassword: 'new-password',
  headers: {},
};

describe('UpdatePasswordUseCase', () => {
  let fakeProvider: FakeAuthIdentityProvider;
  let sut: UpdatePasswordUseCase;

  beforeEach(() => {
    fakeProvider = new FakeAuthIdentityProvider();
    sut = new UpdatePasswordUseCase(fakeProvider);
  });

  it('should return success when provider succeeds', async () => {
    const result = await sut.execute(fakeParams);

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual({ setCookieHeaders: [] });
  });

  it('should forward the correct params to the identity provider', async () => {
    await sut.execute(fakeParams);

    expect(fakeProvider.lastReceivedParams).toEqual(fakeParams);
  });

  it('should forward revokeOtherSessions when provided', async () => {
    const params = { ...fakeParams, revokeOtherSessions: true };

    await sut.execute(params);

    expect(fakeProvider.lastReceivedParams).toEqual(params);
  });

  it('should return failure with InvalidPasswordError when current password is wrong', async () => {
    fakeProvider.simulateInvalidPassword();

    const result = await sut.execute(fakeParams);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidPasswordError);
  });

  it('should return failure with AuthProviderError when the provider fails', async () => {
    fakeProvider.simulateUpdatePasswordResult(
      failure(new AuthProviderError('Upstream unavailable.')),
    );

    const result = await sut.execute(fakeParams);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Upstream unavailable.',
    );
  });

  it('should propagate the exact error instance without re-wrapping', async () => {
    const error = new InvalidPasswordError();
    fakeProvider.simulateUpdatePasswordResult(failure(error));

    const result = await sut.execute(fakeParams);

    expect(result.value).toBe(error);
  });

  it('should return setCookieHeaders from the provider on success', async () => {
    fakeProvider.simulateUpdatePasswordResult(
      success({ setCookieHeaders: ['session=abc; Path=/; HttpOnly'] }),
    );

    const result = await sut.execute(fakeParams);

    expect(result.isSuccess()).toBe(true);
    expect(
      (result.value as { setCookieHeaders: string[] }).setCookieHeaders,
    ).toEqual(['session=abc; Path=/; HttpOnly']);
  });
});
