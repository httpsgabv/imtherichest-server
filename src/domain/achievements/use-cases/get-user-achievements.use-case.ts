import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import {
  achievementDefinitions,
  type AchievementDefinition,
} from '../data/achievement-definitions.js';
import { AchievementsRepository } from '../repositories/achievements-repository.js';

export type GetUserAchievementsUseCaseRequest = {
  userId: UniqueEntityID;
};

export type GetUserAchievementsUseCaseResult = {
  unlockedIds: string[];
  definitions: AchievementDefinition[];
};

@Injectable()
export class GetUserAchievementsUseCase implements UseCase<
  GetUserAchievementsUseCaseRequest,
  GetUserAchievementsUseCaseResult
> {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly achievementsRepository: AchievementsRepository,
  ) {}

  async execute(
    params: GetUserAchievementsUseCaseRequest,
  ): Promise<GetUserAchievementsUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(params.userId);

    const unlockedIds = profile
      ? await this.achievementsRepository.findUnlockedIdsByProfileId(profile.id)
      : [];

    return { unlockedIds, definitions: achievementDefinitions };
  }
}
