import 'dotenv/config';

import * as Sentry from '@sentry/nestjs';

const sentryEnabled =
  process.env.SENTRY_ENABLED === 'true' && Boolean(process.env.SENTRY_DSN);

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  enabled: sentryEnabled,

  environment: process.env.SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
  release: process.env.SENTRY_RELEASE,

  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),

  beforeSend(event) {
    return event;
  },
});
