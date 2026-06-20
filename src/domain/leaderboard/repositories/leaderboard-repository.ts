import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { Profile } from '#domain/users/entities/profile.js';

export type LeaderboardEntry = {
  profile: Profile;
  rank: number;
  // TODO: populate from achievements domain when built
  unlockedAchievementIds: string[];
};

export type GetLeaderboardParams = {
  limit: number;
  cursor?: number;
  search?: string;
};

export type GetLeaderboardResult = {
  entries: LeaderboardEntry[];
  total: number;
  nextCursor: number | null;
};

export abstract class LeaderboardRepository {
  abstract getProfileRank(profileId: UniqueEntityID): Promise<number>;
  abstract getNextRivalDelta(profileId: UniqueEntityID): Promise<number | null>;
  abstract getLeaderboard(
    params: GetLeaderboardParams,
  ): Promise<GetLeaderboardResult>;
}
