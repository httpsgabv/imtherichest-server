import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { EnvService } from '#infra/env/env.service.js';

import { PrismaClient } from '#generated/prisma/client.js';
import { prisma } from './prisma.client.js';

function getDatabaseSchema(url: string) {
  return new URL(url).searchParams.get('schema') ?? undefined;
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(private env: EnvService) {
    const adapter = new PrismaPg(env.get('DATABASE_URL'), {
      schema: getDatabaseSchema(env.get('DATABASE_URL')),
    });

    super({
      log:
        env.get('LOG_PRISMA') === 'true'
          ? ['info', 'warn', 'error', 'query']
          : [],
      adapter,
    });
  }

  get db() {
    return prisma;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
