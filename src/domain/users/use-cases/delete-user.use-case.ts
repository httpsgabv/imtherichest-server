import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { AchievementsRepository } from '#domain/achievements/repositories/achievements-repository.js';
import { PaymentsRepository } from '#domain/payments/repositories/payments-repository.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';
import { UsersRepository } from '../repositories/users-repository.js';

export type DeleteUserUseCaseRequest = {
  requesterId: string;
};

export type DeleteUserUseCaseResult = Either<ResourceNotFoundError, null>;

@Injectable()
export class DeleteUserUseCase implements UseCase<
  DeleteUserUseCaseRequest,
  DeleteUserUseCaseResult
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly profilesRepository: ProfilesRepository,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly achievementsRepository: AchievementsRepository,
  ) {}

  async execute(
    params: DeleteUserUseCaseRequest,
  ): Promise<DeleteUserUseCaseResult> {
    const user = await this.usersRepository.findById(params.requesterId);

    if (!user) {
      return failure(new ResourceNotFoundError('User not found'));
    }

    const userId = new UniqueEntityID(params.requesterId);
    const profile = await this.profilesRepository.findByUserId(userId);

    if (profile) {
      await this.paymentsRepository.deleteByProfileId(profile.id);
      await this.achievementsRepository.deleteByProfileId(profile.id);
      await this.profilesRepository.deleteByUserId(userId);
    }

    // also cascades sessions and accounts
    await this.usersRepository.delete(params.requesterId);

    return success(null);
  }
}
