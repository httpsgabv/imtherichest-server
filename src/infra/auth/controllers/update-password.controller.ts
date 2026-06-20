import { Body, Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UpdatePasswordUseCase } from '#domain/auth/use-cases/update-password.use-case.js';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '#common/swagger/error-response.schema.js';
import { SuccessResponseDto } from '#common/swagger/success-response.schema.js';
import { UpdatePasswordBodyDto } from '../schemas/update-password.schema.js';
import type { Request, Response } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class UpdatePasswordController {
  constructor(private readonly updatePasswordUseCase: UpdatePasswordUseCase) {}

  @Post('update-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update the authenticated user password' })
  @ApiBody({ type: UpdatePasswordBodyDto })
  @ApiOkResponse({
    description: 'Password updated successfully.',
    type: SuccessResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'New session cookies when revokeOtherSessions is true.',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request body failed validation.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Current password is incorrect or no active session.',
    type: ErrorResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'The auth provider returned an unexpected error.',
    type: ErrorResponseDto,
  })
  async handle(
    @Body() body: UpdatePasswordBodyDto,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.updatePasswordUseCase.execute({
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
      revokeOtherSessions: body.revokeOtherSessions,
      headers: req.headers,
    });

    if (result.isFailure()) {
      throw result.value;
    }

    for (const cookie of result.value.setCookieHeaders) {
      response.append('Set-Cookie', cookie);
    }

    return { success: true };
  }
}
