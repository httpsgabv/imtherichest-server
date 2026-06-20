import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { UserAchievement } from '#domain/achievements/entities/user-achievement.js';
import { AchievementsRepository } from '#domain/achievements/repositories/achievements-repository.js';

export class InMemoryAchievementsRepository extends AchievementsRepository {
  public items: UserAchievement[] = [];

  async findUnlockedIdsByProfileId(
    profileId: UniqueEntityID,
  ): Promise<string[]> {
    return this.items
      .filter((a) => a.profileId.equals(profileId))
      .map((a) => a.achievementId);
  }

  async createMany(achievements: UserAchievement[]): Promise<void> {
    for (const achievement of achievements) {
      const exists = this.items.some(
        (a) =>
          a.profileId.equals(achievement.profileId) &&
          a.achievementId === achievement.achievementId,
      );
      if (!exists) this.items.push(achievement);
    }
  }

  async deleteByProfileId(profileId: UniqueEntityID): Promise<void> {
    this.items = this.items.filter((a) => !a.profileId.equals(profileId));
  }
}
