import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { UserAchievement } from '#domain/achievements/entities/user-achievement.js';

type UserAchievementOverride = {
  profileId?: UniqueEntityID;
  achievementId?: string;
  unlockedAt?: Date;
};

export function makeUserAchievement(
  override: UserAchievementOverride = {},
  id?: UniqueEntityID,
): UserAchievement {
  return UserAchievement.create(
    {
      profileId: new UniqueEntityID(),
      achievementId: 'first-purchase',
      ...override,
    },
    id,
  );
}
