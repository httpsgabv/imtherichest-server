import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Payment } from '../entities/payment.js';

export type FindManyByProfileIdParams = {
  limit: number;
  cursor?: string;
};

export type FindManyByProfileIdResult = {
  payments: Payment[];
  nextCursor: string | null;
};

export abstract class PaymentsRepository {
  abstract create(payment: Payment): Promise<void>;
  abstract findManyByProfileId(
    profileId: UniqueEntityID,
    params: FindManyByProfileIdParams,
  ): Promise<FindManyByProfileIdResult>;
}
