import { Entity } from '#core/entities/entity.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Optional } from '#core/types/optional.js';

type NotificationSettingsProps = {
  profileId: UniqueEntityID;
  achievementAlerts: boolean;
  rankAlerts: boolean;
  paymentConfirmations: boolean;
  marketingEmails: boolean;
};

export class NotificationSettings extends Entity<NotificationSettingsProps> {
  get profileId() {
    return this.props.profileId;
  }

  get achievementAlerts() {
    return this.props.achievementAlerts;
  }

  get rankAlerts() {
    return this.props.rankAlerts;
  }

  get paymentConfirmations() {
    return this.props.paymentConfirmations;
  }

  get marketingEmails() {
    return this.props.marketingEmails;
  }

  static create(
    props: Optional<
      NotificationSettingsProps,
      | 'achievementAlerts'
      | 'rankAlerts'
      | 'paymentConfirmations'
      | 'marketingEmails'
    >,
    id?: UniqueEntityID,
  ) {
    return new NotificationSettings(
      {
        achievementAlerts: true,
        rankAlerts: true,
        paymentConfirmations: true,
        marketingEmails: false,
        ...props,
      },
      id,
    );
  }
}
