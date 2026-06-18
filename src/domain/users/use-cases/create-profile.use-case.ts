import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { Profile } from '../entities/profile.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';
import { UsernameAlreadyTakenError } from '../errors/username-already-taken.error.js';

export type CreateProfileUseCaseRequest = {
  userId: UniqueEntityID;
  username: string;
  displayName: string;
};

export type CreateProfileUseCaseResult = Either<
  UsernameAlreadyTakenError,
  { profile: Profile }
>;

@Injectable()
export class CreateProfileUseCase implements UseCase<
  CreateProfileUseCaseRequest,
  CreateProfileUseCaseResult
> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(
    params: CreateProfileUseCaseRequest,
  ): Promise<CreateProfileUseCaseResult> {
    const existing = await this.profilesRepository.findByUsername(
      params.username,
    );

    if (existing) {
      return failure(new UsernameAlreadyTakenError(params.username));
    }

    const profile = Profile.create({
      userId: params.userId,
      username: params.username,
      displayName: params.displayName,
    });

    await this.profilesRepository.create(profile);

    return success({ profile });
  }
}
