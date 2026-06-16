import { Injectable } from '@nestjs/common';
import { IEnvService } from '#infra/env/interfaces/IEnvService.js';
import type { ReadinessResponse } from '../types/health.types.js';

@Injectable()
export class GetReadinessService {
  constructor(private readonly envService: IEnvService) {}

  execute(): ReadinessResponse {
    return {
      status: 'ok',
      service: this.envService.get('APP_NAME'),
      version: this.envService.get('APP_VERSION'),
      environment: this.envService.get('NODE_ENV'),
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      checks: {
        app: 'ok',
      },
    };
  }
}
