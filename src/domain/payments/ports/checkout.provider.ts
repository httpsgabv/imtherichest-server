export type CreateCheckoutSessionParams = {
  amountInCents: number;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
};

export type CheckoutSessionResult = {
  checkoutUrl: string;
  sessionId: string;
};

export abstract class CheckoutProvider {
  abstract createSession(
    params: CreateCheckoutSessionParams,
  ): Promise<CheckoutSessionResult>;
}
