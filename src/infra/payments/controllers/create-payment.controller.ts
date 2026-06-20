import {
  Body,
  Controller,
  HttpCode,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
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
import { CreatePaymentUseCase } from '#domain/payments/use-cases/create-payment.use-case.js';
import { PaymentPresenter } from '../presenters/payment.presenter.js';
import { CreatePaymentBodyDto } from '../schemas/create-payment.schema.js';

@ApiTags('Payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class CreatePaymentController {
  constructor(private readonly createPaymentUseCase: CreatePaymentUseCase) {}

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Record a payment and award points' })
  @ApiCreatedResponse({ description: 'Payment recorded successfully.' })
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
    @Body() body: CreatePaymentBodyDto,
  ) {
    const result = await this.createPaymentUseCase.execute({
      userId: new UniqueEntityID(session.user.id),
      amountInCents: body.amountInCents,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    const { payment, profile, unlockedAchievements } = result.value;

    return {
      payment: PaymentPresenter.present(payment),
      profile,
      unlockedAchievements,
    };
  }
}
