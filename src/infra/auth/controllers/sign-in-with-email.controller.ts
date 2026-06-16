import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { SignInWithEmailUseCase } from '#domain/auth/use-cases/sign-in-with-email.use-case.js';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '#common/swagger/error-response.schema.js';
import {
  SignInWithEmailBodyDto,
  SignInWithEmailResponseDto,
} from '../schemas/sign-in-with-email.schema.js';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class SignInWithEmailController {
  constructor(
    private readonly signInWithEmailUseCase: SignInWithEmailUseCase,
  ) {}

  @AllowAnonymous()
  @Post('sign-in/email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiBody({ type: SignInWithEmailBodyDto })
  @ApiOkResponse({
    description:
      'Sign in successful. Session cookies are set via Set-Cookie headers.',
    type: SignInWithEmailResponseDto,
    headers: {
      'Set-Cookie': {
        description: 'Session cookies issued by the auth provider.',
        schema: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Request body failed validation.',
    type: ValidationErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid email or password.',
    type: ErrorResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'The auth provider returned an unexpected error.',
    type: ErrorResponseDto,
  })
  async handle(
    @Body() body: SignInWithEmailBodyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.signInWithEmailUseCase.execute({
      email: body.email,
      password: body.password,
    });

    if (result.isFailure()) {
      throw result.value;
    }

    for (const cookie of result.value.setCookieHeaders) {
      response.append('Set-Cookie', cookie);
    }

    return {
      user: result.value.user,
    };
  }
}
