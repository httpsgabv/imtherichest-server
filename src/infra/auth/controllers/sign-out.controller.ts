import { Controller, HttpCode, Post, Req, Res } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadGatewayResponse,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { SignOutUseCase } from '#domain/auth/use-cases/sign-out.use-case.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import type { Request, Response } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class SignOutController {
  constructor(private readonly signOutUseCase: SignOutUseCase) {}

  @AllowAnonymous()
  @Post('sign-out')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign out the current user' })
  @ApiOkResponse({
    description:
      'Sign out successful. Session cookies are cleared via Set-Cookie headers.',
    schema: {
      type: 'object',
      properties: { success: { type: 'boolean', example: true } },
    },
    headers: {
      'Set-Cookie': {
        description: 'Cleared session cookies.',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBadGatewayResponse({
    description: 'The auth provider returned an unexpected error.',
    type: ErrorResponseDto,
  })
  async handle(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.signOutUseCase.execute({
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
