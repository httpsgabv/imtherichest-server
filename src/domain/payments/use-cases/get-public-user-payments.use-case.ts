import { Injectable } from '@nestjs/common';
import { NotAllowedError } from '#core/errors/errors/not-allowed.error.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Either } from '#core/utils/either.js';
import { failure, success } from '#core/utils/either.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import type { Payment } from '../entities/payment.js';
import { PaymentsRepository } from '../repositories/payments-repository.js';

export type GetPublicUserPaymentsUseCaseRequest = {
  username: string;
  limit?: number;
  cursor?: string;
};

export type GetPublicUserPaymentsUseCaseResult = Either<
  ResourceNotFoundError | NotAllowedError,
  { payments: Payment[]; nextCursor: string | null }
>;

const PUBLIC_MAX_LIMIT = 8;

@Injectable()
export class GetPublicUserPaymentsUseCase implements UseCase<
  GetPublicUserPaymentsUseCaseRequest,
  GetPublicUserPaymentsUseCaseResult
> {
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly profilesRepository: ProfilesRepository,
  ) {}

  async execute(
    params: GetPublicUserPaymentsUseCaseRequest,
  ): Promise<GetPublicUserPaymentsUseCaseResult> {
    const { username, cursor } = params;
    const limit = Math.min(params.limit ?? PUBLIC_MAX_LIMIT, PUBLIC_MAX_LIMIT);

    const profile = await this.profilesRepository.findByUsername(username);

    if (!profile) {
      return failure(new ResourceNotFoundError('User not found.'));
    }

    if (profile.privacySettings?.showActivity === false) {
      return failure(new NotAllowedError());
    }

    const result = await this.paymentsRepository.findManyByProfileId(
      profile.id,
      { limit, cursor },
    );

    return success(result);
  }
}
