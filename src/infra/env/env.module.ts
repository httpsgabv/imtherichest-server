import { Module } from '@nestjs/common';
import { EnvService } from './env.service.js';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './validate-env.js';
import { IEnvService } from '#infra/env/interfaces/IEnvService.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      envFilePath: ['.env.local', '.env'],
      validate: validateEnv,
    }),
  ],
  providers: [
    {
      provide: IEnvService,
      useClass: EnvService,
    },
  ],
  exports: [IEnvService],
})
export class EnvModule {}
