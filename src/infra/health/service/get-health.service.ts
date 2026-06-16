import { Injectable } from '@nestjs/common';
import { IEnvService } from '#infra/env/interfaces/IEnvService.js';
import type { HealthResponse } from '../types/health.types.js';

@Injectable()
export class GetHealthService {
  constructor(private readonly envService: IEnvService) {}

  execute(): HealthResponse {
    return {
      status: 'ok',
      service: this.envService.get('APP_NAME'),
      version: this.envService.get('APP_VERSION'),
      environment: this.envService.get('NODE_ENV'),
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
