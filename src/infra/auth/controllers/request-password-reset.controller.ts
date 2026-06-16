import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { RequestPasswordResetUseCase } from '#domain/auth/use-cases/request-password-reset.use-case.js';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '#common/swagger/error-response.schema.js';
import { RequestPasswordResetBodyDto } from '../schemas/request-password-reset.schema.js';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class RequestPasswordResetController {
  constructor(
    private readonly requestPasswordResetUseCase: RequestPasswordResetUseCase,
  ) {}

  @AllowAnonymous()
  @Post('request-password-reset')
  @HttpCode(200)
  @ApiOperation({ summary: 'Request a password reset link via email' })
  @ApiBody({ type: RequestPasswordResetBodyDto })
  @ApiOkResponse({
    description:
      'Request processed. A reset link will be sent if the email is registered.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request body failed validation.',
    type: ValidationErrorResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'The auth provider returned an unexpected error.',
    type: ErrorResponseDto,
  })
  async handle(@Body() body: RequestPasswordResetBodyDto) {
    const result = await this.requestPasswordResetUseCase.execute({
      email: body.email,
      redirectTo: body.redirectTo,
    });

    if (result.isFailure()) {
      throw result.value;
    }

    return { success: true };
  }
}
