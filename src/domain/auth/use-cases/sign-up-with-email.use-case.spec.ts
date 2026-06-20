import { failure, success } from '#core/utils/either.js';
import { AuthProviderError } from '#domain/auth/errors/auth-provider.error.js';
import { EmailAlreadyInUserError } from '#domain/auth/errors/email-already-in-use.error.js';
import { UsernameAlreadyTakenError } from '#domain/users/errors/username-already-taken.error.js';
import { FakeAuthIdentityProvider } from '#test/auth/fake-auth-identity-provider.js';
import { InMemoryAchievementsRepository } from '#test/achievements/in-memory-achievements-repository.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { makeUser } from '#test/factories/make-user.js';
import { InMemoryLeaderboardRepository } from '#test/leaderboard/in-memory-leaderboard-repository.js';
import { InMemoryPaymentsRepository } from '#test/payments/in-memory-payments-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { EvaluateAchievementsUseCase } from '#domain/achievements/use-cases/evaluate-achievements.use-case.js';
import { CreateProfileUseCase } from '#domain/users/use-cases/create-profile.use-case.js';
import { SignUpWithEmailUseCase } from './sign-up-with-email.use-case.js';

const DEFAULT_PARAMS = {
  username: 'john_doe',
  email: 'john@example.com',
  password: '12345678',
};

describe('SignUpWithEmailUseCase', () => {
  let fakeProvider: FakeAuthIdentityProvider;
  let profilesRepository: InMemoryProfilesRepository;
  let createProfileUseCase: CreateProfileUseCase;
  let sut: SignUpWithEmailUseCase;

  beforeEach(() => {
    fakeProvider = new FakeAuthIdentityProvider();
    profilesRepository = new InMemoryProfilesRepository();
    const evaluateAchievementsUseCase = new EvaluateAchievementsUseCase(
      profilesRepository,
      new InMemoryPaymentsRepository(),
      new InMemoryLeaderboardRepository(profilesRepository.items),
      new InMemoryAchievementsRepository(),
    );
    createProfileUseCase = new CreateProfileUseCase(
      profilesRepository,
      evaluateAchievementsUseCase,
    );
    sut = new SignUpWithEmailUseCase(fakeProvider, createProfileUseCase);
  });

  it('should return success with user and cookie headers when provider succeeds', async () => {
    const result = await sut.execute(DEFAULT_PARAMS);

    expect(result.isSuccess()).toBe(true);
    expect(result.value).toMatchObject({
      user: expect.any(Object),
      setCookieHeaders: expect.any(Array),
    });
  });

  it('should create a profile after successful sign-up', async () => {
    await sut.execute(DEFAULT_PARAMS);

    expect(profilesRepository.items).toHaveLength(1);
    expect(profilesRepository.items[0].username).toBe('john_doe');
    expect(profilesRepository.items[0].displayName).toBe('john_doe');
  });

  it('should forward the correct params to the identity provider', async () => {
    await sut.execute(DEFAULT_PARAMS);

    expect(fakeProvider.lastReceivedParams).toMatchObject({
      email: 'john@example.com',
      password: '12345678',
      username: 'john_doe',
    });
  });

  it('should return failure with EmailAlreadyInUserError when email is already in use', async () => {
    fakeProvider.simulateEmailAlreadyInUse('john@example.com');

    const result = await sut.execute(DEFAULT_PARAMS);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(EmailAlreadyInUserError);
    expect((result.value as EmailAlreadyInUserError).message).toBe(
      'Email john@example.com is already in use.',
    );
  });

  it('should not create a profile when the provider returns an error', async () => {
    fakeProvider.simulateProviderError('Upstream service unavailable.');

    await sut.execute(DEFAULT_PARAMS);

    expect(profilesRepository.items).toHaveLength(0);
  });

  it('should return failure with AuthProviderError when provider returns an error', async () => {
    fakeProvider.simulateProviderError('Upstream service unavailable.');

    const result = await sut.execute(DEFAULT_PARAMS);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(AuthProviderError);
    expect((result.value as AuthProviderError).message).toBe(
      'Upstream service unavailable.',
    );
  });

  it('should return failure with UsernameAlreadyTakenError when username is taken', async () => {
    profilesRepository.items.push(makeProfile({ username: 'john_doe' }));

    const result = await sut.execute(DEFAULT_PARAMS);

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(UsernameAlreadyTakenError);
  });

  it('should propagate the exact error instance without re-wrapping', async () => {
    const error = new EmailAlreadyInUserError('john@example.com');
    fakeProvider.simulateResult(failure(error));

    const result = await sut.execute(DEFAULT_PARAMS);

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
      username: 'some_user',
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
