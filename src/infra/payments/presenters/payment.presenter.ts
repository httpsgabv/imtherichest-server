import type { Payment } from '#domain/payments/entities/payment.js';

export class PaymentPresenter {
  static present(payment: Payment) {
    return {
      id: payment.id.toString(),
      amount: payment.amount,
      points: payment.points,
      createdAt: payment.createdAt.toISOString(),
    };
  }
}
