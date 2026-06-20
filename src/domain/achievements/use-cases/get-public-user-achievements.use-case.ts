import { Injectable } from '@nestjs/common';
import { NotAllowedError } from '#core/errors/errors/not-allowed.error.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { Either } from '#core/utils/either.js';
import { failure, success } from '#core/utils/either.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import {
  achievementDefinitions,
  type AchievementDefinition,
} from '../data/achievement-definitions.js';
import { AchievementsRepository } from '../repositories/achievements-repository.js';

export type GetPublicUserAchievementsUseCaseRequest = {
  username: string;
};

export type GetPublicUserAchievementsUseCaseResult = Either<
  ResourceNotFoundError | NotAllowedError,
  { unlockedIds: string[]; definitions: AchievementDefinition[] }
>;

@Injectable()
export class GetPublicUserAchievementsUseCase implements UseCase<
  GetPublicUserAchievementsUseCaseRequest,
  GetPublicUserAchievementsUseCaseResult
> {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly achievementsRepository: AchievementsRepository,
  ) {}

  async execute(
    params: GetPublicUserAchievementsUseCaseRequest,
  ): Promise<GetPublicUserAchievementsUseCaseResult> {
    const profile = await this.profilesRepository.findByUsername(
      params.username,
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('User not found.'));
    }

    if (profile.privacySettings?.showAchievements === false) {
      return failure(new NotAllowedError());
    }

    const unlockedIds =
      await this.achievementsRepository.findUnlockedIdsByProfileId(profile.id);

    return success({ unlockedIds, definitions: achievementDefinitions });
  }
}
