import type { LeaderboardEntry } from '#domain/leaderboard/repositories/leaderboard-repository.js';

export class LeaderboardUserPresenter {
  static present(entry: LeaderboardEntry) {
    const { profile, rank, unlockedAchievementIds } = entry;
    const showTotalPaid = profile.privacySettings?.showTotalPaid !== false;
    const showAchievements =
      profile.privacySettings?.showAchievements !== false;

    return {
      rank,
      username: profile.username,
      displayName: profile.displayName,
      points: profile.points,
      totalPaid: showTotalPaid ? profile.totalPaid : null,
      country: profile.country,
      avatarUrl: profile.avatarUrl,
      achievements: showAchievements ? unlockedAchievementIds : [],
    };
  }
}
