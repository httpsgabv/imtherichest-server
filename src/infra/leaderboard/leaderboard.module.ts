import { Module } from '@nestjs/common';
import { LeaderboardRepository } from '#domain/leaderboard/repositories/leaderboard-repository.js';
import { GetLeaderboardUseCase } from '#domain/leaderboard/use-cases/get-leaderboard.use-case.js';
import { GetUserRankUseCase } from '#domain/leaderboard/use-cases/get-user-rank.use-case.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { UsersModule } from '#infra/users/users.module.js';
import { GetLeaderboardController } from './controllers/get-leaderboard.controller.js';
import { GetUserRankController } from './controllers/get-user-rank.controller.js';
import { PrismaLeaderboardRepository } from './repositories/prisma-leaderboard.repository.js';

@Module({
  imports: [DatabaseModule, UsersModule],
  controllers: [GetLeaderboardController, GetUserRankController],
  providers: [
    GetLeaderboardUseCase,
    GetUserRankUseCase,
    {
      provide: LeaderboardRepository,
      useClass: PrismaLeaderboardRepository,
    },
  ],
  exports: [LeaderboardRepository],
})
export class LeaderboardModule {}
