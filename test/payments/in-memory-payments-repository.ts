import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Payment } from '#domain/payments/entities/payment.js';
import {
  PaymentsRepository,
  type FindManyByProfileIdParams,
  type FindManyByProfileIdResult,
} from '#domain/payments/repositories/payments-repository.js';

export class InMemoryPaymentsRepository extends PaymentsRepository {
  public items: Payment[] = [];

  async create(payment: Payment): Promise<void> {
    this.items.push(payment);
  }

  async findManyByProfileId(
    profileId: UniqueEntityID,
    params: FindManyByProfileIdParams,
  ): Promise<FindManyByProfileIdResult> {
    const { limit, cursor } = params;

    const filtered = this.items
      .filter((p) => p.profileId.equals(profileId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    let startIndex = 0;

    if (cursor) {
      const cursorIndex = filtered.findIndex((p) => p.id.toString() === cursor);
      if (cursorIndex >= 0) {
        startIndex = cursorIndex + 1;
      }
    }

    const page = filtered.slice(startIndex, startIndex + limit);
    const nextCursor =
      startIndex + limit < filtered.length
        ? (page[page.length - 1]?.id.toString() ?? null)
        : null;

    return { payments: page, nextCursor };
  }

  async listByProfileId(profileId: UniqueEntityID): Promise<Payment[]> {
    return this.items
      .filter((p) => p.profileId.equals(profileId))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async deleteByProfileId(profileId: UniqueEntityID): Promise<void> {
    this.items = this.items.filter((p) => !p.profileId.equals(profileId));
  }
}
