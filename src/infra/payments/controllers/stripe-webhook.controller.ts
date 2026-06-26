import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  InternalServerErrorException,
  Logger,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import Stripe from 'stripe';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { CreatePaymentUseCase } from '#domain/payments/use-cases/create-payment.use-case.js';
import { PaymentsRepository } from '#domain/payments/repositories/payments-repository.js';
import { EnvService } from '#infra/env/env.service.js';
import { StripeService } from '#infra/stripe/stripe.service.js';
import type { RequestWithRawBody } from '#common/middleware/raw-body.middleware.js';

@ApiTags('Payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly createPaymentUseCase: CreatePaymentUseCase,
    private readonly envService: EnvService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  @AllowAnonymous()
  @SkipThrottle()
  @ApiOperation({ summary: 'Stripe webhook receiver' })
  @ApiOkResponse({ description: 'Webhook received.' })
  async handle(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = (req as RequestWithRawBody).rawBody;

    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      throw new BadRequestException('Missing raw body.');
    }

    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header.');
    }

    let event: Stripe.Event;

    try {
      event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature,
        this.envService.stripeWebhookSecret,
      );
    } catch (err) {
      if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
        throw new UnauthorizedException('Invalid webhook signature.');
      }
      this.logger.error('Failed to construct webhook event', err);
      throw new InternalServerErrorException();
    }

    if (event.type !== 'checkout.session.completed') {
      return { received: true };
    }

    const session = event.data.object;
    const stripeSessionId = session.id;
    const amountInCents = session.amount_total;
    const userId = session.metadata?.userId;

    if (!stripeSessionId || amountInCents == null || !userId) {
      this.logger.warn(
        `Checkout session ${stripeSessionId} is missing required data`,
      );
      return { received: true };
    }

    const existing =
      await this.paymentsRepository.findByStripeSessionId(stripeSessionId);

    if (existing) {
      this.logger.log(
        `Duplicate webhook for session ${stripeSessionId} — already processed`,
      );
      return { received: true };
    }

    const result = await this.createPaymentUseCase.execute({
      userId: new UniqueEntityID(userId),
      amountInCents,
      stripeSessionId,
    });

    if (result.isFailure()) {
      this.logger.error(
        `Failed to process payment for session ${stripeSessionId}: ${result.value.message}`,
      );
      return { received: true };
    }

    this.logger.log(
      `Payment processed for session ${stripeSessionId} — ${amountInCents} cents`,
    );

    return { received: true };
  }
}
