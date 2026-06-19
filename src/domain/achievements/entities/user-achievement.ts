import { Entity } from '#core/entities/entity.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Optional } from '#core/types/optional.js';

type UserAchievementProps = {
  profileId: UniqueEntityID;
  achievementId: string;
  unlockedAt: Date;
};

export class UserAchievement extends Entity<UserAchievementProps> {
  get profileId() {
    return this.props.profileId;
  }

  get achievementId() {
    return this.props.achievementId;
  }

  get unlockedAt() {
    return this.props.unlockedAt;
  }

  static create(
    props: Optional<UserAchievementProps, 'unlockedAt'>,
    id?: UniqueEntityID,
  ) {
    return new UserAchievement(
      {
        ...props,
        unlockedAt: props.unlockedAt ?? new Date(),
      },
      id,
    );
  }
}
