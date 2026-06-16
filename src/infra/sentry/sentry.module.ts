import { DebugSentryController } from '#infra/debug/sentry/controllers/debug-sentry.controller.js';
import { DebugSentryService } from '#infra/debug/sentry/services/debug-sentry.service.js';
import { Module } from '@nestjs/common';
import { SentryModule as SentryModuleRoot } from '@sentry/nestjs/setup';

@Module({
  imports: [SentryModuleRoot.forRoot()],
  controllers: [DebugSentryController],
  providers: [DebugSentryService],
})
export class SentryModule {}
