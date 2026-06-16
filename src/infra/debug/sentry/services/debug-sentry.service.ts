import { Injectable } from '@nestjs/common';

@Injectable()
export class DebugSentryService {
  constructor() {}

  execute() {
    throw new Error('Sentry error debug');
  }
}
