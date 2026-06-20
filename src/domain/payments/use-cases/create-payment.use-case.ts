import { Injectable } from '@nestjs/common';
import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Either } from '#core/utils/either.js';
import { failure, success } from '#core/utils/either.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { Payment } from '../entities/payment.js';
import { InvalidAmountError } from '../errors/invalid-amount.error.js';
import { PaymentsRepository } from '../repositories/payments-repository.js';

export type CreatePaymentUseCaseRequest = {
  userId: UniqueEntityID;
  amountInCents: number;
};

export type CreatePaymentUseCaseResult = Either<
  InvalidAmountError | ResourceNotFoundError,
  {
    payment: Payment;
    profile: { points: number; totalPaid: number; rank: number };
    unlockedAchievements: string[];
  }
>;

@Injectable()
export class CreatePaymentUseCase implements UseCase<
  CreatePaymentUseCaseRequest,
  CreatePaymentUseCaseResult
> {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(
    params: CreatePaymentUseCaseRequest,
  ): Promise<CreatePaymentUseCaseResult> {
    const { userId, amountInCents } = params;

    if (!Number.isInteger(amountInCents) || amountInCents < 100) {
      return failure(new InvalidAmountError());
    }

    const profile = await this.profilesRepository.findByUserId(userId);

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found.'));
    }

    const payment = Payment.create({
      profileId: profile.id,
      amount: amountInCents,
    });

    profile.creditPayment(amountInCents, payment.points);

    await this.paymentsRepository.create(payment);
    await this.profilesRepository.savePoints(profile);

    const rank = await this.profilesRepository.getProfileRank(profile.id);

    // TODO: call evaluate-achievements use-case when achievements domain is built
    const unlockedAchievements: string[] = [];

    return success({
      payment,
      profile: {
        points: profile.points,
        totalPaid: profile.totalPaid,
        rank,
      },
      unlockedAchievements,
    });
  }
}
