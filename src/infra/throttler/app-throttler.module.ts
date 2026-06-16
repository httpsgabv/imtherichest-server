import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  minutes,
  seconds,
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: isTest
        ? [{ name: 'disabled', ttl: 1, limit: Number.MAX_SAFE_INTEGER }]
        : [
            {
              name: 'short',
              ttl: seconds(1),
              limit: 10,
            },
            {
              name: 'default',
              ttl: minutes(1),
              limit: 100,
            },
          ],
    }),
  ],
  providers: isTest
    ? []
    : [
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
      ],
})
export class AppThrottlerModule {}
