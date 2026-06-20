import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Profile } from '#domain/users/entities/profile.js';
import {
  LeaderboardRepository,
  type GetLeaderboardParams,
  type GetLeaderboardResult,
} from '#domain/leaderboard/repositories/leaderboard-repository.js';

export class InMemoryLeaderboardRepository extends LeaderboardRepository {
  constructor(private readonly profiles: Profile[] = []) {
    super();
  }

  async getProfileRank(profileId: UniqueEntityID): Promise<number> {
    const profile = this.profiles.find((p) => p.id.equals(profileId));
    if (!profile) return 1;
    return this.profiles.filter((p) => p.points > profile.points).length + 1;
  }

  async getNextRivalDelta(profileId: UniqueEntityID): Promise<number | null> {
    const profile = this.profiles.find((p) => p.id.equals(profileId));
    if (!profile) return null;
    const rivals = this.profiles
      .filter((p) => p.points > profile.points)
      .sort((a, b) => a.points - b.points);
    if (rivals.length === 0) return null;
    return rivals[0].points - profile.points;
  }

  async getLeaderboard(
    params: GetLeaderboardParams,
  ): Promise<GetLeaderboardResult> {
    const { limit, cursor = 0, search } = params;

    let visible = this.profiles.filter(
      (p) => p.privacySettings?.publicProfile !== false,
    );

    if (search) {
      const lower = search.toLowerCase();
      visible = visible.filter(
        (p) =>
          p.username.includes(lower) ||
          p.displayName.toLowerCase().includes(lower),
      );
    }

    visible.sort((a, b) => b.points - a.points);

    const total = visible.length;
    const page = visible.slice(cursor, cursor + limit + 1);
    const hasMore = page.length > limit;
    const pageProfiles = page.slice(0, limit);

    const entries = await Promise.all(
      pageProfiles.map(async (profile) => ({
        profile,
        rank: await this.getProfileRank(profile.id),
        // TODO: fetch unlockedAchievementIds from achievements domain when built
        unlockedAchievementIds: [] as string[],
      })),
    );

    return {
      entries,
      total,
      nextCursor: hasMore ? cursor + limit : null,
    };
  }
}
