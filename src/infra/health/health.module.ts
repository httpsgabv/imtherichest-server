import { Module } from '@nestjs/common';
import { EnvModule } from '#infra/env/env.module.js';
import { EnvService } from '#infra/env/env.service.js';
import { GetHealthController } from './controllers/get-health.controller.js';
import { GetLivenessController } from './controllers/get-liveness.controller.js';
import { GetReadinessController } from './controllers/get-readiness.controller.js';
import { GetHealthService } from './service/get-health.service.js';
import { GetLivenessService } from './service/get-liveness.service.js';
import { GetReadinessService } from './service/get-readiness.service.js';

@Module({
  imports: [EnvModule],
  controllers: [
    GetHealthController,
    GetLivenessController,
    GetReadinessController,
  ],
  providers: [
    GetHealthService,
    GetLivenessService,
    GetReadinessService,
    EnvService,
  ],
})
export class HealthModule {}
