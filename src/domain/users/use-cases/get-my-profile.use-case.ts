import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Profile } from '../entities/profile.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';

export type GetMyProfileUseCaseRequest = {
  requesterId: string;
};

export type GetMyProfileUseCaseResult = Either<
  ResourceNotFoundError,
  { profile: Profile }
>;

@Injectable()
export class GetMyProfileUseCase implements UseCase<
  GetMyProfileUseCaseRequest,
  GetMyProfileUseCaseResult
> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(
    params: GetMyProfileUseCaseRequest,
  ): Promise<GetMyProfileUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(
      new UniqueEntityID(params.requesterId),
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found'));
    }

    return success({ profile });
  }
}
