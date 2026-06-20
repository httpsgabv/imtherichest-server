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

  async save(profile: Profile): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(profile.id));
    if (index >= 0) {
      this.items[index] = profile;
    }
  }

  async savePrivacySettings(profile: Profile): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(profile.id));
    if (index >= 0) {
      this.items[index] = profile;
    }
  }

  async saveNotificationSettings(profile: Profile): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(profile.id));
    if (index >= 0) {
      this.items[index] = profile;
    }
  }

  async savePoints(profile: Profile): Promise<void> {
    const index = this.items.findIndex((p) => p.id.equals(profile.id));
    if (index >= 0) {
      this.items[index] = profile;
    }
  }

  // TODO: move getProfileRank to LeaderboardRepository when leaderboard domain is built
  async getProfileRank(profileId: UniqueEntityID): Promise<number> {
    const profile = this.items.find((p) => p.id.equals(profileId));
    if (!profile) return 1;
    return this.items.filter((p) => p.points > profile.points).length + 1;
  }
}
