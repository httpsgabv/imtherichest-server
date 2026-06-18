import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Profile } from '#domain/users/entities/profile.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';

export class InMemoryProfilesRepository extends ProfilesRepository {
  public items: Profile[] = [];

  async findByUserId(userId: UniqueEntityID): Promise<Profile | null> {
    return this.items.find((p) => p.userId.equals(userId)) ?? null;
  }

  async findByUsername(username: string): Promise<Profile | null> {
    return this.items.find((p) => p.username === username) ?? null;
  }

  async create(profile: Profile): Promise<void> {
    this.items.push(profile);
  }
}
