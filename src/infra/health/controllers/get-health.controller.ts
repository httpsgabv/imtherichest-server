import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetHealthService } from '../service/get-health.service.js';
import type { HealthResponse } from '../types/health.types.js';

@ApiTags('Health')
@Controller({
  path: 'health',
  version: '1',
})
export class GetHealthController {
  constructor(private readonly getHealthService: GetHealthService) {}

  @Get('/')
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get service health' })
  @ApiOkResponse({
    description: 'Service is healthy.',
    schema: {
      type: 'object',
      required: [
        'status',
        'service',
        'version',
        'environment',
        'uptime',
        'timestamp',
      ],
      properties: {
        status: { type: 'string', enum: ['ok'] },
        service: { type: 'string' },
        version: { type: 'string' },
        environment: { type: 'string' },
        uptime: {
          type: 'integer',
          minimum: 0,
          description: 'Process uptime in seconds.',
        },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  handle(): HealthResponse {
    return this.getHealthService.execute();
  }
}
