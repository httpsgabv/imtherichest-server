import type { Payment as PrismaPayment } from '#generated/prisma/client.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Payment } from '#domain/payments/entities/payment.js';
import type { Prisma } from '#generated/prisma/client.js';

export class PrismaPaymentMapper {
  static toDomain(raw: PrismaPayment): Payment {
    return Payment.create(
      {
        profileId: new UniqueEntityID(raw.profileId),
        amount: raw.amount,
        points: raw.points,
        stripeSessionId: raw.stripeSessionId ?? undefined,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(payment: Payment): Prisma.PaymentUncheckedCreateInput {
    return {
      id: payment.id.toString(),
      profileId: payment.profileId.toString(),
      amount: payment.amount,
      points: payment.points,
      stripeSessionId: payment.stripeSessionId ?? null,
      createdAt: payment.createdAt,
    };
  }
}
