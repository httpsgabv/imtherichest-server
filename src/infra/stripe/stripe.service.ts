import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { EnvService } from '#infra/env/env.service.js';

export type CreateStripeCheckoutSessionParams = {
  amountInCents: number;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
};

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly envService: EnvService) {
    this.stripe = new Stripe(this.envService.stripeSecretKey, {
      apiVersion: '2026-06-24.dahlia',
    });
  }

  async createCheckoutSession(
    params: CreateStripeCheckoutSessionParams,
  ): Promise<Stripe.Checkout.Session> {
    const { amountInCents, successUrl, cancelUrl, metadata } = params;

    return this.stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: amountInCents,
            product_data: {
              name: 'Points',
              description: `${Math.round(amountInCents / 100)} points added to your account`,
            },
          },
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
  }

  constructWebhookEvent(
    payload: Buffer,
    signature: string,
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, signature, secret);
  }
}
