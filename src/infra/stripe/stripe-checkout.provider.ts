import { Injectable } from '@nestjs/common';
import {
  CheckoutProvider,
  type CheckoutSessionResult,
  type CreateCheckoutSessionParams,
} from '#domain/payments/ports/checkout.provider.js';
import { StripeService } from './stripe.service.js';

@Injectable()
export class StripeCheckoutProvider extends CheckoutProvider {
  constructor(private readonly stripeService: StripeService) {
    super();
  }

  async createSession(
    params: CreateCheckoutSessionParams,
  ): Promise<CheckoutSessionResult> {
    const session = await this.stripeService.createCheckoutSession(params);

    return {
      checkoutUrl: session.url!,
      sessionId: session.id,
    };
  }
}
