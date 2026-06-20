import { Injectable } from '@nestjs/common';
import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Either } from '#core/utils/either.js';
import { failure, success } from '#core/utils/either.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import type { Payment } from '../entities/payment.js';
import { PaymentsRepository } from '../repositories/payments-repository.js';

export type GetUserPaymentsUseCaseRequest = {
  userId: UniqueEntityID;
  limit?: number;
  cursor?: string;
};

export type GetUserPaymentsUseCaseResult = Either<
  ResourceNotFoundError,
  { payments: Payment[]; nextCursor: string | null }
>;

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

@Injectable()
export class GetUserPaymentsUseCase implements UseCase<
  GetUserPaymentsUseCaseRequest,
  GetUserPaymentsUseCaseResult
> {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(
    params: GetUserPaymentsUseCaseRequest,
  ): Promise<GetUserPaymentsUseCaseResult> {
    const { userId, cursor } = params;
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const profile = await this.profilesRepository.findByUserId(userId);

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found.'));
    }

    const result = await this.paymentsRepository.findManyByProfileId(
      profile.id,
      { limit, cursor },
    );

    return success(result);
  }
}
