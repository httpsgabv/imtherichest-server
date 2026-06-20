import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { EvaluateAchievementsUseCase } from '#domain/achievements/use-cases/evaluate-achievements.use-case.js';
import { InMemoryAchievementsRepository } from '#test/achievements/in-memory-achievements-repository.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { InMemoryLeaderboardRepository } from '#test/leaderboard/in-memory-leaderboard-repository.js';
import { InMemoryPaymentsRepository } from '#test/payments/in-memory-payments-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import { InvalidAmountError } from '../errors/invalid-amount.error.js';
import { CreatePaymentUseCase } from './create-payment.use-case.js';

const USER_ID = new UniqueEntityID('user-1');

describe('CreatePaymentUseCase', () => {
  let paymentsRepository: InMemoryPaymentsRepository;
  let profilesRepository: InMemoryProfilesRepository;
  let leaderboardRepository: InMemoryLeaderboardRepository;
  let achievementsRepository: InMemoryAchievementsRepository;
  let evaluateAchievementsUseCase: EvaluateAchievementsUseCase;
  let sut: CreatePaymentUseCase;

  beforeEach(() => {
    paymentsRepository = new InMemoryPaymentsRepository();
    profilesRepository = new InMemoryProfilesRepository();
    leaderboardRepository = new InMemoryLeaderboardRepository(
      profilesRepository.items,
    );
    achievementsRepository = new InMemoryAchievementsRepository();
    evaluateAchievementsUseCase = new EvaluateAchievementsUseCase(
      profilesRepository,
      paymentsRepository,
      leaderboardRepository,
      achievementsRepository,
    );
    sut = new CreatePaymentUseCase(
      paymentsRepository,
      profilesRepository,
      leaderboardRepository,
      evaluateAchievementsUseCase,
    );
  });

  it('should create a payment and return correct shape', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ userId: USER_ID, amountInCents: 500 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;

    expect(result.value.payment.amount).toBe(500);
    expect(result.value.payment.points).toBe(5);
    expect(result.value.profile.points).toBe(5);
    expect(result.value.profile.totalPaid).toBe(500);
    expect(result.value.unlockedAchievements).toContain('first-purchase');
  });

  it('should evaluate and unlock achievements on payment', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ userId: USER_ID, amountInCents: 10000 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    // $100 single payment → first-purchase + sheesh; sole profile → rank-1.
    expect(result.value.unlockedAchievements).toEqual(
      expect.arrayContaining(['first-purchase', 'sheesh', 'rank-1']),
    );
    // register-only achievements are not unlocked by a payment event.
    expect(result.value.unlockedAchievements).not.toContain('verified-email');
  });

  it('should calculate points as Math.round(amount / 100)', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    const result = await sut.execute({ userId: USER_ID, amountInCents: 150 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.payment.points).toBe(2);
  });

  it('should persist the payment', async () => {
    const profile = makeProfile({ userId: USER_ID });
    profilesRepository.items.push(profile);

    await sut.execute({ userId: USER_ID, amountInCents: 1000 });

    expect(paymentsRepository.items).toHaveLength(1);
    expect(paymentsRepository.items[0].amount).toBe(1000);
  });

  it('should increment profile points and totalPaid', async () => {
    const profile = makeProfile({
      userId: USER_ID,
      points: 10,
      totalPaid: 1000,
    });
    profilesRepository.items.push(profile);

    await sut.execute({ userId: USER_ID, amountInCents: 500 });

    expect(profile.points).toBe(15);
    expect(profile.totalPaid).toBe(1500);
  });

  it('should return correct rank in result', async () => {
    const profile = makeProfile({ userId: USER_ID, points: 0 });
    const other = makeProfile({ points: 100 });
    profilesRepository.items.push(profile, other);

    const result = await sut.execute({ userId: USER_ID, amountInCents: 100 });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    // after payment profile has 1 point, other has 100 → rank 2
    expect(result.value.profile.rank).toBe(2);
  });

  it('should return InvalidAmountError when amountInCents < 100', async () => {
    const result = await sut.execute({ userId: USER_ID, amountInCents: 99 });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAmountError);
  });

  it('should return InvalidAmountError when amountInCents is 0', async () => {
    const result = await sut.execute({ userId: USER_ID, amountInCents: 0 });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAmountError);
  });

  it('should return InvalidAmountError when amountInCents is a float', async () => {
    const result = await sut.execute({ userId: USER_ID, amountInCents: 150.5 });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(InvalidAmountError);
  });

  it('should return ResourceNotFoundError when profile does not exist', async () => {
    const result = await sut.execute({ userId: USER_ID, amountInCents: 500 });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should not persist a payment when validation fails', async () => {
    await sut.execute({ userId: USER_ID, amountInCents: 50 });

    expect(paymentsRepository.items).toHaveLength(0);
  });
});
