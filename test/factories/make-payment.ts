import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Payment } from '#domain/payments/entities/payment.js';
import { faker } from '@faker-js/faker';

type PaymentOverride = {
  profileId?: UniqueEntityID;
  amount?: number;
  points?: number;
  createdAt?: Date;
};

export function makePayment(
  override: PaymentOverride = {},
  id?: UniqueEntityID,
): Payment {
  return Payment.create(
    {
      profileId: new UniqueEntityID(),
      amount: faker.number.int({ min: 100, max: 100000 }),
      ...override,
    },
    id,
  );
}
