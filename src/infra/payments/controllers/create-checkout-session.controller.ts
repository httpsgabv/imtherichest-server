import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '#common/swagger/error-response.schema.js';
import { InvalidAmountError } from '#domain/payments/errors/invalid-amount.error.js';
import { CreateCheckoutSessionUseCase } from '#domain/payments/use-cases/create-checkout-session.use-case.js';
import { EnvService } from '#infra/env/env.service.js';
import {
  CreateCheckoutSessionBodyDto,
  CreateCheckoutSessionResponseDto,
} from '../schemas/create-checkout-session.schema.js';

@ApiTags('Payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class CreateCheckoutSessionController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly envService: EnvService,
  ) {}

  @Post('checkout')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a Stripe Checkout Session' })
  @ApiBody({ type: CreateCheckoutSessionBodyDto })
  @ApiCreatedResponse({
    description: 'Checkout session created.',
    type: CreateCheckoutSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid amount.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Profile not found.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
    type: ErrorResponseDto,
  })
  async handle(
    @Session() session: UserSession,
    @Body() body: CreateCheckoutSessionBodyDto,
  ) {
    const result = await this.createCheckoutSessionUseCase.execute({
      userId: new UniqueEntityID(session.user.id),
      amountInCents: body.amountInCents,
      successUrl: this.envService.stripeSuccessUrl,
      cancelUrl: this.envService.stripeCancelUrl,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      if (result.value instanceof InvalidAmountError) {
        throw new BadRequestException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    return { checkoutUrl: result.value.checkoutUrl };
  }
}
