import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { UserAchievement } from '../entities/user-achievement.js';

export abstract class AchievementsRepository {
  abstract findUnlockedIdsByProfileId(
    profileId: UniqueEntityID,
  ): Promise<string[]>;
  abstract createMany(achievements: UserAchievement[]): Promise<void>;
  abstract deleteByProfileId(profileId: UniqueEntityID): Promise<void>;
}
