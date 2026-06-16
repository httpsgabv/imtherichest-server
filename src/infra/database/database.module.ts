import { Module } from '@nestjs/common';
import { EnvModule } from '#infra/env/env.module.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';
import { EnvService } from '#infra/env/env.service.js';

@Module({
  imports: [EnvModule],
  providers: [PrismaService, EnvService],
  exports: [PrismaService],
})
export class DatabaseModule {}
