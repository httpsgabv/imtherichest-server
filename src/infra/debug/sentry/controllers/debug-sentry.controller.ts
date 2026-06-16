import { Controller, Get } from '@nestjs/common';
import { DebugSentryService } from '#infra/debug/sentry/services/debug-sentry.service.js';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller({
  path: 'debug-sentry',
  version: '1',
})
export class DebugSentryController {
  constructor(private readonly debugSentryService: DebugSentryService) {}

  @Get('/')
  @AllowAnonymous()
  handle() {
    return this.debugSentryService.execute();
  }
}
