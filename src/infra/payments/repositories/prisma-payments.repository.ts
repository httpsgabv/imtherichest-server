import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Payment } from '#domain/payments/entities/payment.js';
import {
  PaymentsRepository,
  type FindManyByProfileIdParams,
  type FindManyByProfileIdResult,
} from '#domain/payments/repositories/payments-repository.js';
import type { Prisma } from '#generated/prisma/client.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';
import { PrismaPaymentMapper } from '../mappers/prisma-payment.mapper.js';

@Injectable()
export class PrismaPaymentsRepository extends PaymentsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(payment: Payment): Promise<void> {
    await this.prisma.payment.create({
      data: PrismaPaymentMapper.toPrisma(payment),
    });
  }

  async findByStripeSessionId(
    stripeSessionId: string,
  ): Promise<Payment | null> {
    const row = await this.prisma.payment.findUnique({
      where: { stripeSessionId },
    });

    if (!row) return null;

    return PrismaPaymentMapper.toDomain(row);
  }

  async findManyByProfileId(
    profileId: UniqueEntityID,
    params: FindManyByProfileIdParams,
  ): Promise<FindManyByProfileIdResult> {
    const { limit, cursor } = params;

    const args: Prisma.PaymentFindManyArgs = {
      where: { profileId: profileId.toString() },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
    };

    if (cursor) {
      args.cursor = { id: cursor };
      args.skip = 1;
    }

    const rows = await this.prisma.payment.findMany(args);

    const hasMore = rows.length > limit;
    const payments = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? (payments[payments.length - 1]?.id ?? null)
      : null;

    return {
      payments: payments.map(PrismaPaymentMapper.toDomain),
      nextCursor,
    };
  }

  async deleteByProfileId(profileId: UniqueEntityID): Promise<void> {
    await this.prisma.payment.deleteMany({
      where: { profileId: profileId.toString() },
    });
  }

  async listByProfileId(profileId: UniqueEntityID): Promise<Payment[]> {
    const rows = await this.prisma.payment.findMany({
      where: { profileId: profileId.toString() },
      orderBy: { createdAt: 'asc' },
    });

    return rows.map(PrismaPaymentMapper.toDomain);
  }
}
