import { Entity } from '#core/entities/entity.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Optional } from '#core/types/optional.js';
import type { PrivacySettings } from './privacy-settings.js';
import type { NotificationSettings } from './notification-settings.js';

type ProfileProps = {
  userId: UniqueEntityID;
  username: string;
  displayName: string;
  bio: string;
  country: string;
  avatarUrl: string | null;
  points: number;
  totalPaid: number;
  privacySettings: PrivacySettings | null;
  notificationSettings: NotificationSettings | null;
  createdAt: Date;
  updatedAt?: Date | null;
};

export class Profile extends Entity<ProfileProps> {
  get userId() {
    return this.props.userId;
  }

  get username() {
    return this.props.username;
  }

  get displayName() {
    return this.props.displayName;
  }

  get bio() {
    return this.props.bio;
  }

  get country() {
    return this.props.country;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  get points() {
    return this.props.points;
  }

  get totalPaid() {
    return this.props.totalPaid;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get privacySettings() {
    return this.props.privacySettings;
  }

  get notificationSettings() {
    return this.props.notificationSettings;
  }

  setPrivacySettings(privacySettings: PrivacySettings) {
    this.props.privacySettings = privacySettings;
  }

  setNotificationSettings(notificationSettings: NotificationSettings) {
    this.props.notificationSettings = notificationSettings;
  }

  update(fields: {
    displayName?: string;
    bio?: string;
    country?: string;
    avatarUrl?: string | null;
  }) {
    if (fields.displayName !== undefined)
      this.props.displayName = fields.displayName;
    if (fields.bio !== undefined) this.props.bio = fields.bio;
    if (fields.country !== undefined) this.props.country = fields.country;
    if (fields.avatarUrl !== undefined) this.props.avatarUrl = fields.avatarUrl;
    this.props.updatedAt = new Date();
  }

  static create(
    props: Optional<
      ProfileProps,
      | 'bio'
      | 'country'
      | 'avatarUrl'
      | 'points'
      | 'totalPaid'
      | 'privacySettings'
      | 'notificationSettings'
      | 'createdAt'
    >,
    id?: UniqueEntityID,
  ) {
    return new Profile(
      {
        bio: '',
        country: '',
        avatarUrl: null,
        points: 0,
        totalPaid: 0,
        privacySettings: null,
        notificationSettings: null,
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }
}
