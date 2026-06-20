import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Either } from '#core/utils/either.js';
import { failure, success } from '#core/utils/either.js';
import type { Payment } from '#domain/payments/entities/payment.js';
import { PaymentsRepository } from '#domain/payments/repositories/payments-repository.js';
import { LeaderboardRepository } from '#domain/leaderboard/repositories/leaderboard-repository.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import {
  achievementDefinitions,
  NORMAL_ACHIEVEMENT_IDS,
} from '../data/achievement-definitions.js';
import { UserAchievement } from '../entities/user-achievement.js';
import { AchievementsRepository } from '../repositories/achievements-repository.js';

export type AchievementEvent = 'register' | 'payment';

export type EvaluateAchievementsUseCaseRequest = {
  userId: UniqueEntityID;
  event: AchievementEvent;
};

export type EvaluateAchievementsUseCaseResult = Either<
  ResourceNotFoundError,
  { newlyUnlocked: string[] }
>;

type EvaluationState = {
  event: AchievementEvent;
  points: number;
  totalPaid: number;
  rank: number;
  bio: string;
  accountCreatedAt: Date;
  payments: Payment[];
  alreadyUnlocked: Set<string>;
};

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const BITCOIN_WHALE_CENTS = 6_000_000;
const SERIAL_SPENDER_DAYS = 30;

/**
 * Pure, server-side achievement evaluation. All time/date checks use UTC and all
 * amounts are in cents. Returns the full set of achievement ids the user qualifies
 * for given this state (including ones already unlocked).
 */
export function getQualifiedAchievementIds(
  state: EvaluationState,
): Set<string> {
  const { event, points, totalPaid, rank, bio, accountCreatedAt, payments } =
    state;
  const totalPayments = payments.length;
  const qualified = new Set<string>();
  const mark = (id: string, condition: boolean): void => {
    if (condition) qualified.add(id);
  };

  // normal
  mark('verified-email', event === 'register');
  mark('first-login', event === 'register');
  mark('first-purchase', totalPayments >= 1);
  mark('spent-100', totalPaid >= 10_000);
  mark('spent-1000', totalPaid >= 100_000);
  mark('spent-10000', totalPaid >= 1_000_000);
  mark('top-100', rank <= 100);
  mark('top-10', rank <= 10);
  mark('top-3', rank <= 3);
  mark('rank-1', rank === 1);

  // weird
  mark(
    'night-owl',
    payments.some((p) => p.createdAt.getUTCHours() === 3),
  );
  mark('bitcoin-whale', totalPaid >= BITCOIN_WHALE_CENTS);

  const paymentDays = new Set(payments.map((p) => p.createdAt.getUTCDay()));
  mark('weekend-warrior', paymentDays.has(6) && paymentDays.has(0));

  mark(
    'lucky-seven',
    payments.some(
      (p) => p.createdAt.getUTCMonth() === 6 && p.createdAt.getUTCDate() === 7,
    ),
  );

  const distinctCalendarDays = new Set(
    payments.map((p) => p.createdAt.toISOString().slice(0, 10)),
  );
  mark('serial-spender', distinctCalendarDays.size >= SERIAL_SPENDER_DAYS);

  // millionaire-mindset & insomniac: never auto-unlocked (deferred / undefined)

  const firstPayment = payments.reduce<Payment | null>((earliest, p) => {
    if (!earliest) return p;
    return p.createdAt.getTime() < earliest.createdAt.getTime() ? p : earliest;
  }, null);
  mark(
    'speed-runner',
    firstPayment !== null &&
      firstPayment.createdAt.getTime() - accountCreatedAt.getTime() >= 0 &&
      firstPayment.createdAt.getTime() - accountCreatedAt.getTime() <=
        FIVE_MINUTES_MS,
  );

  mark('tax-collector', points === 404);
  mark('nice', points === 69);
  mark('over-9000', points > 9000);

  // meme
  mark('based', points === 420);
  mark(
    'certified-baller',
    payments.some((p) => p.amount >= 50_000),
  );
  mark(
    'goblin-mode',
    payments.some((p) => p.createdAt.getUTCHours() === 2),
  );
  mark('perfect-score', totalPayments === 10);
  mark('say-less', rank <= 50 && bio.trim() === '');
  mark('vibe-check', accountCreatedAt.getUTCDay() === 5);
  mark(
    'rents-due',
    payments.some((p) => p.amount === 100),
  );
  mark(
    'fr-fr',
    payments.some((p) => {
      const d = p.createdAt;
      return d.getUTCDay() === 5 && d.getUTCDate() === 13;
    }),
  );
  mark(
    'sheesh',
    payments.some((p) => p.amount >= 10_000),
  );

  // understood-assignment depends on the union of newly-qualified and previously
  // unlocked normal achievements.
  const normalUnlocked = NORMAL_ACHIEVEMENT_IDS.every(
    (id) => qualified.has(id) || state.alreadyUnlocked.has(id),
  );
  mark('understood-assignment', normalUnlocked);

  return qualified;
}

@Injectable()
export class EvaluateAchievementsUseCase implements UseCase<
  EvaluateAchievementsUseCaseRequest,
  EvaluateAchievementsUseCaseResult
> {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly achievementsRepository: AchievementsRepository,
  ) {}

  async execute(
    params: EvaluateAchievementsUseCaseRequest,
  ): Promise<EvaluateAchievementsUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(params.userId);

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found.'));
    }

    const [payments, rank, alreadyUnlockedIds] = await Promise.all([
      this.paymentsRepository.listByProfileId(profile.id),
      this.leaderboardRepository.getProfileRank(profile.id),
      this.achievementsRepository.findUnlockedIdsByProfileId(profile.id),
    ]);

    const alreadyUnlocked = new Set(alreadyUnlockedIds);

    const qualified = getQualifiedAchievementIds({
      event: params.event,
      points: profile.points,
      totalPaid: profile.totalPaid,
      rank,
      bio: profile.bio,
      accountCreatedAt: profile.createdAt,
      payments,
      alreadyUnlocked,
    });

    // Preserve catalogue order and exclude anything already unlocked.
    const newlyUnlocked = achievementDefinitions
      .filter((def) => qualified.has(def.id) && !alreadyUnlocked.has(def.id))
      .map((def) => def.id);

    if (newlyUnlocked.length > 0) {
      await this.achievementsRepository.createMany(
        newlyUnlocked.map((achievementId) =>
          UserAchievement.create({ profileId: profile.id, achievementId }),
        ),
      );
    }

    return success({ newlyUnlocked });
  }
}
