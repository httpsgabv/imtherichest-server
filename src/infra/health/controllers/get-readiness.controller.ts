import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetReadinessService } from '../service/get-readiness.service.js';
import type { ReadinessResponse } from '../types/health.types.js';

@ApiTags('Health')
@Controller({
  path: 'health',
  version: '1',
})
export class GetReadinessController {
  constructor(private readonly getReadinessService: GetReadinessService) {}

  @Get('/ready')
  @AllowAnonymous()
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Indicates whether the service is ready to handle requests.',
  })
  @ApiOkResponse({
    description: 'Service is ready.',
    schema: {
      type: 'object',
      required: [
        'status',
        'service',
        'version',
        'environment',
        'uptime',
        'timestamp',
        'checks',
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
        checks: {
          type: 'object',
          required: ['app'],
          properties: {
            app: { type: 'string', enum: ['ok'] },
          },
        },
      },
    },
  })
  handle(): ReadinessResponse {
    return this.getReadinessService.execute();
  }
}
