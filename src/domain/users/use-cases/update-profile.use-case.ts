import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Profile } from '../entities/profile.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';

export type UpdateProfileUseCaseRequest = {
  requesterId: string;
  displayName?: string;
  bio?: string;
  country?: string;
  avatarUrl?: string | null;
};

export type UpdateProfileUseCaseResult = Either<
  ResourceNotFoundError,
  { profile: Profile }
>;

@Injectable()
export class UpdateProfileUseCase implements UseCase<
  UpdateProfileUseCaseRequest,
  UpdateProfileUseCaseResult
> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(
    params: UpdateProfileUseCaseRequest,
  ): Promise<UpdateProfileUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(
      new UniqueEntityID(params.requesterId),
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found'));
    }

    profile.update({
      displayName: params.displayName,
      bio: params.bio,
      country: params.country,
      avatarUrl: params.avatarUrl,
    });

    await this.profilesRepository.save(profile);

    return success({ profile });
  }
}
