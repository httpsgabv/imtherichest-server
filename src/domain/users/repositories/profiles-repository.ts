import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Profile } from '../entities/profile.js';

export abstract class ProfilesRepository {
  abstract findByUserId(userId: UniqueEntityID): Promise<Profile | null>;
  abstract findByUsername(username: string): Promise<Profile | null>;
  abstract create(profile: Profile): Promise<void>;
}
