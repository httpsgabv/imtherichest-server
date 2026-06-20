import { Module } from '@nestjs/common';
import { AchievementsRepository } from '#domain/achievements/repositories/achievements-repository.js';
import { EvaluateAchievementsUseCase } from '#domain/achievements/use-cases/evaluate-achievements.use-case.js';
import { GetAchievementsUseCase } from '#domain/achievements/use-cases/get-achievements.use-case.js';
import { GetPublicUserAchievementsUseCase } from '#domain/achievements/use-cases/get-public-user-achievements.use-case.js';
import { GetUserAchievementsUseCase } from '#domain/achievements/use-cases/get-user-achievements.use-case.js';
import { LeaderboardRepository } from '#domain/leaderboard/repositories/leaderboard-repository.js';
import { PaymentsRepository } from '#domain/payments/repositories/payments-repository.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { PrismaLeaderboardRepository } from '#infra/leaderboard/repositories/prisma-leaderboard.repository.js';
import { PrismaPaymentsRepository } from '#infra/payments/repositories/prisma-payments.repository.js';
import { PrismaProfilesRepository } from '#infra/users/repositories/prisma-profiles.repository.js';
import { GetAchievementsController } from './controllers/get-achievements.controller.js';
import { GetPublicUserAchievementsController } from './controllers/get-public-user-achievements.controller.js';
import { GetUserAchievementsController } from './controllers/get-user-achievements.controller.js';
import { PrismaAchievementsRepository } from './repositories/prisma-achievements.repository.js';

/**
 * Repositories from other domains are rebound here to their Prisma implementations
 * (instead of importing UsersModule / PaymentsModule / LeaderboardModule) so that
 * those modules can import this one — `create-profile` and `create-payment` depend on
 * `EvaluateAchievementsUseCase`. The Prisma repositories are stateless, so rebinding
 * is safe and avoids a circular module graph.
 */
@Module({
  imports: [DatabaseModule],
  controllers: [
    GetAchievementsController,
    GetUserAchievementsController,
    GetPublicUserAchievementsController,
  ],
  providers: [
    GetAchievementsUseCase,
    GetUserAchievementsUseCase,
    GetPublicUserAchievementsUseCase,
    EvaluateAchievementsUseCase,
    {
      provide: AchievementsRepository,
      useClass: PrismaAchievementsRepository,
    },
    {
      provide: ProfilesRepository,
      useClass: PrismaProfilesRepository,
    },
    {
      provide: PaymentsRepository,
      useClass: PrismaPaymentsRepository,
    },
    {
      provide: LeaderboardRepository,
      useClass: PrismaLeaderboardRepository,
    },
  ],
  exports: [EvaluateAchievementsUseCase],
})
export class AchievementsModule {}
