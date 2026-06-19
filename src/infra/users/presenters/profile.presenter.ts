import type { Profile } from '#domain/users/entities/profile.js';

export class ProfilePresenter {
  static present(profile: Profile) {
    return {
      id: profile.id.toString(),
      userId: profile.userId.toString(),
      username: profile.username,
      displayName: profile.displayName,
      bio: profile.bio,
      country: profile.country,
      avatarUrl: profile.avatarUrl,
      points: profile.points,
      totalPaid: profile.totalPaid,
      privacySettings: profile.privacySettings
        ? {
            publicProfile: profile.privacySettings.publicProfile,
            showTotalPaid: profile.privacySettings.showTotalPaid,
            showAchievements: profile.privacySettings.showAchievements,
            showActivity: profile.privacySettings.showActivity,
          }
        : null,
      notificationSettings: profile.notificationSettings
        ? {
            achievementAlerts: profile.notificationSettings.achievementAlerts,
            rankAlerts: profile.notificationSettings.rankAlerts,
            paymentConfirmations:
              profile.notificationSettings.paymentConfirmations,
            marketingEmails: profile.notificationSettings.marketingEmails,
          }
        : null,
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt?.toISOString() ?? null,
    };
  }
}
