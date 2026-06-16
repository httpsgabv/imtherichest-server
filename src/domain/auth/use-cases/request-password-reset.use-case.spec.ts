import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { FakeAuthIdentityProvider } from '#test/auth/fake-auth-identity-provider.js';
import { RequestPasswordResetUseCase } from './request-password-reset.use-case.js';

const fakeParams = { email: 'user@example.com' };

describe('RequestPasswordResetUseCase', () => {
  let fakeProvider: FakeAuthIdentityProvider;
  let sut: RequestPasswordResetUseCase;

  beforeEach(() => {
    fakeProvider = new FakeAuthIdentityProvider();
    sut = new RequestPasswordResetUseCase(fakeProvider);
  });

  it('should return success when provider succeeds', async () => {
    const result = await sut.execute(fakeParams);

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toEqual({});
  });

  it('should forward the correct params to the identity provider', async () => {
    await sut.execute(fakeParams);

    expect(fakeProvider.lastReceivedParams).toEqual(fakeParams);
  });

  it('should forward redirectTo when provided', async () => {
    const params = {
      email: 'user@example.com',
      redirectTo: 'https://app.example.com/reset',
    };

    await sut.execute(params);

    expect(fakeProvider.lastReceivedParams).toEqual(params);
  });

  it('should return failure with AuthProviderError when the provider fails', async () => {
    fakeProvider.simulateRequestPasswordResetResult(
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
    const error = new AuthProviderError('raw error');
    fakeProvider.simulateRequestPasswordResetResult(failure(error));

    const result = await sut.execute(fakeParams);

    expect(result.value).toBe(error);
  });

  it('should always return success regardless of whether the email exists', async () => {
    fakeProvider.simulateRequestPasswordResetResult(success({}));

    const result = await sut.execute({ email: 'nonexistent@example.com' });

    expect(result.isSuccess()).toBe(true);
  });
});
