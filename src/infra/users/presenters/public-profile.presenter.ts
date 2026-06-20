import type { Profile } from '#domain/users/entities/profile.js';

type PublicProfileInput = {
  profile: Profile;
  rank: number;
  isOwner: boolean;
};

export class PublicProfilePresenter {
  static present({ profile, rank, isOwner }: PublicProfileInput) {
    // Owners always see their own figures; otherwise respect showTotalPaid.
    const canSeeTotalPaid =
      isOwner || profile.privacySettings?.showTotalPaid !== false;

    return {
      id: profile.id.toString(),
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      country: profile.country,
      avatarUrl: profile.avatarUrl,
      points: profile.points,
      totalPaid: canSeeTotalPaid ? profile.totalPaid : null,
      rank,
      isOwner,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt?.toISOString() ?? null,
      privacySettings: profile.privacySettings
        ? {
            publicProfile: profile.privacySettings.publicProfile,
            showTotalPaid: profile.privacySettings.showTotalPaid,
            showAchievements: profile.privacySettings.showAchievements,
            showActivity: profile.privacySettings.showActivity,
          }
        : null,
    };
  }
}
