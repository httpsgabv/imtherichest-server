import { Injectable } from '@nestjs/common';
import type { UseCase } from '#core/use-cases/use-case.js';
import {
  achievementDefinitions,
  type AchievementDefinition,
} from '../data/achievement-definitions.js';

export type GetAchievementsUseCaseRequest = void;

export type GetAchievementsUseCaseResult = {
  achievements: AchievementDefinition[];
};

@Injectable()
export class GetAchievementsUseCase implements UseCase<
  GetAchievementsUseCaseRequest,
  GetAchievementsUseCaseResult
> {
  async execute(): Promise<GetAchievementsUseCaseResult> {
    return { achievements: achievementDefinitions };
  }
}
