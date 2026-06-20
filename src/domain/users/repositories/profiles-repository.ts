import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Profile } from '../entities/profile.js';

export abstract class ProfilesRepository {
  abstract findByUserId(userId: UniqueEntityID): Promise<Profile | null>;
  abstract findByUsername(username: string): Promise<Profile | null>;
  abstract create(profile: Profile): Promise<void>;
  abstract save(profile: Profile): Promise<void>;
  abstract savePrivacySettings(profile: Profile): Promise<void>;
  abstract saveNotificationSettings(profile: Profile): Promise<void>;
  abstract savePoints(profile: Profile): Promise<void>;
}
