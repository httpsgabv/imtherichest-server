import { Controller, Get, Req } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadGatewayResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetSessionUseCase } from '#domain/auth/use-cases/get-session.use-case.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { GetSessionResponseDto } from '../schemas/get-session.schema.js';
import type { Request } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class GetSessionController {
  constructor(private readonly getSessionUseCase: GetSessionUseCase) {}

  @AllowAnonymous()
  @Get('get-session')
  @ApiOperation({ summary: 'Get the current session' })
  @ApiOkResponse({
    description: 'Active session returned.',
    type: GetSessionResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'No active session found.',
    type: ErrorResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'The auth provider returned an unexpected error.',
    type: ErrorResponseDto,
  })
  async handle(@Req() req: Request) {
    const result = await this.getSessionUseCase.execute({
      headers: req.headers,
    });

    if (result.isFailure()) {
      throw result.value;
    }

    return {
      user: result.value.user,
      session: result.value.session,
    };
  }
}
