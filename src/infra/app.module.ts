import {
  Module,
  type MiddlewareConsumer,
  type NestModule,
} from '@nestjs/common';
import { EnvModule } from '#infra/env/env.module.js';
import { EnvService } from '#infra/env/env.service.js';
import { ValidationModule } from '#common/validation/validation.module.js';
import { FiltersModule } from '#common/filters/filters.module.js';
import { RequestIdMiddleware } from '#common/middleware/request-id.middleware.js';
import { LoggerModule } from '#infra/logger/logger.module.js';
import { SentryModule } from '#infra/sentry/sentry.module.js';
import { AppThrottlerModule } from '#infra/throttler/app-throttler.module.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { AuthModule } from '#infra/auth/auth.module.js';
import { UsersModule } from '#infra/users/users.module.js';
import { PaymentsModule } from '#infra/payments/payments.module.js';
import { LeaderboardModule } from '#infra/leaderboard/leaderboard.module.js';
import { AchievementsModule } from '#infra/achievements/achievements.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ValidationModule,
    EnvModule,
    FiltersModule,
    HealthModule,
    LoggerModule,
    SentryModule,
    AppThrottlerModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    PaymentsModule,
    LeaderboardModule,
    AchievementsModule,
  ],
  providers: [EnvService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*path');
  }
}
