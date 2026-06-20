import { Module } from '@nestjs/common';
import { PaymentsRepository } from '#domain/payments/repositories/payments-repository.js';
import { CreatePaymentUseCase } from '#domain/payments/use-cases/create-payment.use-case.js';
import { GetPublicUserPaymentsUseCase } from '#domain/payments/use-cases/get-public-user-payments.use-case.js';
import { GetUserPaymentsUseCase } from '#domain/payments/use-cases/get-user-payments.use-case.js';
import { AchievementsModule } from '#infra/achievements/achievements.module.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { LeaderboardModule } from '#infra/leaderboard/leaderboard.module.js';
import { UsersModule } from '#infra/users/users.module.js';
import { CreatePaymentController } from './controllers/create-payment.controller.js';
import { GetPublicUserPaymentsController } from './controllers/get-public-user-payments.controller.js';
import { GetUserPaymentsController } from './controllers/get-user-payments.controller.js';
import { PrismaPaymentsRepository } from './repositories/prisma-payments.repository.js';

@Module({
  imports: [DatabaseModule, UsersModule, LeaderboardModule, AchievementsModule],
  controllers: [
    CreatePaymentController,
    GetUserPaymentsController,
    GetPublicUserPaymentsController,
  ],
  providers: [
    CreatePaymentUseCase,
    GetUserPaymentsUseCase,
    GetPublicUserPaymentsUseCase,
    {
      provide: PaymentsRepository,
      useClass: PrismaPaymentsRepository,
    },
  ],
})
export class PaymentsModule {}
