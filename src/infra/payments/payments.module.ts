import { Module } from '@nestjs/common';
import { CheckoutProvider } from '#domain/payments/ports/checkout.provider.js';
import { PaymentsRepository } from '#domain/payments/repositories/payments-repository.js';
import { CreateCheckoutSessionUseCase } from '#domain/payments/use-cases/create-checkout-session.use-case.js';
import { CreatePaymentUseCase } from '#domain/payments/use-cases/create-payment.use-case.js';
import { GetPublicUserPaymentsUseCase } from '#domain/payments/use-cases/get-public-user-payments.use-case.js';
import { GetUserPaymentsUseCase } from '#domain/payments/use-cases/get-user-payments.use-case.js';
import { AchievementsModule } from '#infra/achievements/achievements.module.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { EnvService } from '#infra/env/env.service.js';
import { LeaderboardModule } from '#infra/leaderboard/leaderboard.module.js';
import { StripeCheckoutProvider } from '#infra/stripe/stripe-checkout.provider.js';
import { StripeModule } from '#infra/stripe/stripe.module.js';
import { UsersModule } from '#infra/users/users.module.js';
import { CreateCheckoutSessionController } from './controllers/create-checkout-session.controller.js';
import { CreatePaymentController } from './controllers/create-payment.controller.js';
import { GetPublicUserPaymentsController } from './controllers/get-public-user-payments.controller.js';
import { GetUserPaymentsController } from './controllers/get-user-payments.controller.js';
import { StripeWebhookController } from './controllers/stripe-webhook.controller.js';
import { PrismaPaymentsRepository } from './repositories/prisma-payments.repository.js';

@Module({
  imports: [
    DatabaseModule,
    UsersModule,
    LeaderboardModule,
    AchievementsModule,
    StripeModule,
  ],
  controllers: [
    CreatePaymentController,
    CreateCheckoutSessionController,
    StripeWebhookController,
    GetUserPaymentsController,
    GetPublicUserPaymentsController,
  ],
  providers: [
    CreatePaymentUseCase,
    CreateCheckoutSessionUseCase,
    GetUserPaymentsUseCase,
    GetPublicUserPaymentsUseCase,
    {
      provide: PaymentsRepository,
      useClass: PrismaPaymentsRepository,
    },
    {
      provide: CheckoutProvider,
      useClass: StripeCheckoutProvider,
    },
    EnvService,
  ],
})
export class PaymentsModule {}
