import { Body, Controller, HttpCode, Post, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { SignUpWithEmailUseCase } from '#domain/auth/use-cases/sign-up-with-email.use-case.js';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '#common/swagger/error-response.schema.js';
import {
  SignUpWithEmailBodyDto,
  SignUpWithEmailResponseDto,
} from '../schemas/sign-up-with-email.schema.js';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class SignUpWithEmailController {
  constructor(
    private readonly signUpWithEmailUseCase: SignUpWithEmailUseCase,
  ) {}

  @AllowAnonymous()
  @Post('sign-up/email')
  @HttpCode(201)
  @ApiOperation({ summary: 'Sign up with email and password' })
  @ApiBody({ type: SignUpWithEmailBodyDto })
  @ApiCreatedResponse({
    description:
      'User created. Session cookies are set via Set-Cookie headers.',
    type: SignUpWithEmailResponseDto,
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
  @ApiConflictResponse({
    description: 'A user with this email already exists.',
    type: ErrorResponseDto,
  })
  @ApiBadGatewayResponse({
    description: 'The auth provider returned an unexpected error.',
    type: ErrorResponseDto,
  })
  async handle(
    @Body() body: SignUpWithEmailBodyDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.signUpWithEmailUseCase.execute({
      name: body.name,
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
