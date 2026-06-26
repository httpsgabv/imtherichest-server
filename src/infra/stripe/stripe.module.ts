import { Module } from '@nestjs/common';
import { EnvService } from '#infra/env/env.service.js';
import { StripeCheckoutProvider } from './stripe-checkout.provider.js';
import { StripeService } from './stripe.service.js';

@Module({
  providers: [EnvService, StripeService, StripeCheckoutProvider],
  exports: [StripeService, StripeCheckoutProvider],
})
export class StripeModule {}
