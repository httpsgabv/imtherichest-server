import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { InMemoryAchievementsRepository } from '#test/achievements/in-memory-achievements-repository.js';
import { makePayment } from '#test/factories/make-payment.js';
import { makeProfile } from '#test/factories/make-profile.js';
import { makeUserAchievement } from '#test/factories/make-user-achievement.js';
import { InMemoryLeaderboardRepository } from '#test/leaderboard/in-memory-leaderboard-repository.js';
import { InMemoryPaymentsRepository } from '#test/payments/in-memory-payments-repository.js';
import { InMemoryProfilesRepository } from '#test/users/in-memory-profiles-repository.js';
import type { Profile } from '#domain/users/entities/profile.js';
import { EvaluateAchievementsUseCase } from './evaluate-achievements.use-case.js';

const USER_ID = new UniqueEntityID('user-1');
// A Monday, so the default profile does not trip `vibe-check` (Friday account).
const MONDAY = new Date('2021-01-04T12:00:00Z');

function setup() {
  const profilesRepository = new InMemoryProfilesRepository();
  const paymentsRepository = new InMemoryPaymentsRepository();
  const leaderboardRepository = new InMemoryLeaderboardRepository(
    profilesRepository.items,
  );
  const achievementsRepository = new InMemoryAchievementsRepository();
  const sut = new EvaluateAchievementsUseCase(
    profilesRepository,
    paymentsRepository,
    leaderboardRepository,
    achievementsRepository,
  );
  return {
    profilesRepository,
    paymentsRepository,
    leaderboardRepository,
    achievementsRepository,
    sut,
  };
}

type Ctx = ReturnType<typeof setup>;

function addProfile(
  ctx: Ctx,
  override: Parameters<typeof makeProfile>[0] = {},
): Profile {
  const profile = makeProfile({
    userId: USER_ID,
    createdAt: MONDAY,
    ...override,
  });
  ctx.profilesRepository.items.push(profile);
  return profile;
}

function addPayment(
  ctx: Ctx,
  profile: Profile,
  amount: number,
  createdAt: Date,
) {
  ctx.paymentsRepository.items.push(
    makePayment({ profileId: profile.id, amount, createdAt }),
  );
}

describe('EvaluateAchievementsUseCase', () => {
  it('should return ResourceNotFoundError when the profile does not exist', async () => {
    const ctx = setup();

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isFailure()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });

  it('should unlock verified-email and first-login on register', async () => {
    const ctx = setup();
    addProfile(ctx);

    const result = await ctx.sut.execute({
      userId: USER_ID,
      event: 'register',
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toEqual(
      expect.arrayContaining(['verified-email', 'first-login']),
    );
  });

  it('should NOT unlock verified-email / first-login on a payment event', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, MONDAY);

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).not.toContain('verified-email');
    expect(result.value.newlyUnlocked).not.toContain('first-login');
  });

  it('should unlock vibe-check only when the account was created on a Friday', async () => {
    const friday = new Date('2021-01-01T12:00:00Z'); // Friday
    const ctx = setup();
    addProfile(ctx, { createdAt: friday });

    const result = await ctx.sut.execute({
      userId: USER_ID,
      event: 'register',
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('vibe-check');
  });

  it('should unlock spend-tier achievements at the correct cent boundaries', async () => {
    const ctx = setup();
    const profile = addProfile(ctx, { totalPaid: 10_000 });
    addPayment(ctx, profile, 10_000, MONDAY);

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('first-purchase');
    expect(result.value.newlyUnlocked).toContain('spent-100');
    expect(result.value.newlyUnlocked).not.toContain('spent-1000');
  });

  it('should unlock sheesh and certified-baller for large single payments', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 50_000, MONDAY); // $500

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toEqual(
      expect.arrayContaining(['sheesh', 'certified-baller']),
    );
  });

  it('should unlock rents-due for an exact $1.00 payment', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 100, MONDAY);

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('rents-due');
  });

  it('should unlock bitcoin-whale at $60,000 lifetime', async () => {
    const ctx = setup();
    addProfile(ctx, { totalPaid: 6_000_000 });

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('bitcoin-whale');
  });

  it.each([
    ['nice', 69],
    ['based', 420],
    ['tax-collector', 404],
  ])('should unlock %s at exactly %d points', async (id, points) => {
    const ctx = setup();
    addProfile(ctx, { points });

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain(id);
  });

  it('should unlock over-9000 only above 9000 points', async () => {
    const ctx = setup();
    addProfile(ctx, { points: 9001 });

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('over-9000');
  });

  it('should unlock rank-based achievements for the sole (rank 1) profile', async () => {
    const ctx = setup();
    addProfile(ctx);

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toEqual(
      expect.arrayContaining(['top-100', 'top-10', 'top-3', 'rank-1']),
    );
  });

  it('should not unlock top achievements when outranked', async () => {
    const ctx = setup();
    addProfile(ctx, { points: 0 });
    // Push 5 higher-ranked profiles so the user is rank 6.
    for (let i = 0; i < 5; i++) {
      ctx.profilesRepository.items.push(makeProfile({ points: 1000 }));
    }

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('top-100');
    expect(result.value.newlyUnlocked).toContain('top-10');
    expect(result.value.newlyUnlocked).not.toContain('top-3');
    expect(result.value.newlyUnlocked).not.toContain('rank-1');
  });

  it('should unlock say-less for a top-50 user with an empty bio', async () => {
    const ctx = setup();
    addProfile(ctx, { bio: '' });

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('say-less');
  });

  it('should NOT unlock say-less when the bio is non-empty', async () => {
    const ctx = setup();
    addProfile(ctx, { bio: 'hello world' });

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).not.toContain('say-less');
  });

  it('should unlock night-owl for a payment at 03:xx UTC', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, new Date('2021-01-04T03:30:00Z'));

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('night-owl');
  });

  it('should unlock goblin-mode for a payment at 02:xx UTC', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, new Date('2021-01-04T02:15:00Z'));

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('goblin-mode');
  });

  it('should unlock lucky-seven for a payment on July 7', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, new Date('2021-07-07T12:00:00Z'));

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('lucky-seven');
  });

  it('should unlock fr-fr for a payment on Friday the 13th', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, new Date('2023-01-13T12:00:00Z')); // Fri 13th

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('fr-fr');
  });

  it('should unlock weekend-warrior with payments on both Saturday and Sunday', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, new Date('2021-01-02T12:00:00Z')); // Saturday
    addPayment(ctx, profile, 500, new Date('2021-01-03T12:00:00Z')); // Sunday

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('weekend-warrior');
  });

  it('should unlock serial-spender across 30 distinct calendar days', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    for (let day = 1; day <= 30; day++) {
      const dd = String(day).padStart(2, '0');
      addPayment(ctx, profile, 500, new Date(`2021-03-${dd}T12:00:00Z`));
    }

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('serial-spender');
  });

  it('should unlock speed-runner when the first payment is within 5 minutes of signup', async () => {
    const ctx = setup();
    const profile = addProfile(ctx, { createdAt: MONDAY });
    addPayment(ctx, profile, 500, new Date('2021-01-04T12:03:00Z'));

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('speed-runner');
  });

  it('should NOT unlock speed-runner when the first payment is later than 5 minutes', async () => {
    const ctx = setup();
    const profile = addProfile(ctx, { createdAt: MONDAY });
    addPayment(ctx, profile, 500, new Date('2021-01-04T12:30:00Z'));

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).not.toContain('speed-runner');
  });

  it('should unlock perfect-score at exactly 10 payments', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    for (let i = 0; i < 10; i++) {
      addPayment(
        ctx,
        profile,
        500,
        new Date(`2021-04-0${(i % 9) + 1}T12:00:00Z`),
      );
    }

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('perfect-score');
  });

  it('should unlock understood-assignment when all 10 normal achievements are met', async () => {
    const ctx = setup();
    const profile = addProfile(ctx, { totalPaid: 1_000_000 });
    addPayment(ctx, profile, 1_000_000, MONDAY);

    const result = await ctx.sut.execute({
      userId: USER_ID,
      event: 'register',
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).toContain('understood-assignment');
  });

  it('should never auto-unlock millionaire-mindset or insomniac', async () => {
    const ctx = setup();
    const profile = addProfile(ctx, { points: 420, totalPaid: 6_000_000 });
    addPayment(ctx, profile, 50_000, new Date('2021-01-04T03:00:00Z'));

    const result = await ctx.sut.execute({
      userId: USER_ID,
      event: 'register',
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).not.toContain('millionaire-mindset');
    expect(result.value.newlyUnlocked).not.toContain('insomniac');
  });

  it('should not re-unlock achievements that are already unlocked (idempotent)', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, MONDAY);
    ctx.achievementsRepository.items.push(
      makeUserAchievement({
        profileId: profile.id,
        achievementId: 'first-purchase',
      }),
    );

    const result = await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    expect(result.value.newlyUnlocked).not.toContain('first-purchase');
  });

  it('should persist newly unlocked achievements', async () => {
    const ctx = setup();
    const profile = addProfile(ctx);
    addPayment(ctx, profile, 500, MONDAY);

    await ctx.sut.execute({ userId: USER_ID, event: 'payment' });

    const stored = await ctx.achievementsRepository.findUnlockedIdsByProfileId(
      profile.id,
    );
    expect(stored).toContain('first-purchase');
  });

  it('should return newly unlocked ids in catalogue order', async () => {
    const ctx = setup();
    addProfile(ctx);

    const result = await ctx.sut.execute({
      userId: USER_ID,
      event: 'register',
    });

    expect(result.isSuccess()).toBe(true);
    if (!result.isSuccess()) return;
    // verified-email precedes first-login in the catalogue.
    const ids = result.value.newlyUnlocked;
    expect(ids.indexOf('verified-email')).toBeLessThan(
      ids.indexOf('first-login'),
    );
  });
});
