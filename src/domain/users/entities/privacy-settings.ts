import { Entity } from '#core/entities/entity.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Optional } from '#core/types/optional.js';

type PrivacySettingsProps = {
  profileId: UniqueEntityID;
  publicProfile: boolean;
  showTotalPaid: boolean;
  showAchievements: boolean;
  showActivity: boolean;
};

export class PrivacySettings extends Entity<PrivacySettingsProps> {
  get profileId() {
    return this.props.profileId;
  }

  get publicProfile() {
    return this.props.publicProfile;
  }

  get showTotalPaid() {
    return this.props.showTotalPaid;
  }

  get showAchievements() {
    return this.props.showAchievements;
  }

  get showActivity() {
    return this.props.showActivity;
  }

  static create(
    props: Optional<
      PrivacySettingsProps,
      'publicProfile' | 'showTotalPaid' | 'showAchievements' | 'showActivity'
    >,
    id?: UniqueEntityID,
  ) {
    return new PrivacySettings(
      {
        publicProfile: true,
        showTotalPaid: true,
        showAchievements: true,
        showActivity: true,
        ...props,
      },
      id,
    );
  }
}
