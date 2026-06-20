import type { UserExportData } from '#domain/users/repositories/users-repository.js';

export class UserExportDataPresenter {
  static present(data: UserExportData) {
    const { profile } = data;

    return {
      exportedAt: new Date().toISOString(),
      user: {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        emailVerified: data.user.emailVerified,
        createdAt: data.user.createdAt.toISOString(),
        updatedAt: data.user.updatedAt?.toISOString() ?? null,
      },
      profile: profile
        ? {
            id: profile.id.toString(),
            username: profile.username,
            displayName: profile.displayName,
            bio: profile.bio,
            country: profile.country,
            avatarUrl: profile.avatarUrl,
            points: profile.points,
            totalPaid: profile.totalPaid,
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
            notificationSettings: profile.notificationSettings
              ? {
                  achievementAlerts:
                    profile.notificationSettings.achievementAlerts,
                  rankAlerts: profile.notificationSettings.rankAlerts,
                  paymentConfirmations:
                    profile.notificationSettings.paymentConfirmations,
                  marketingEmails: profile.notificationSettings.marketingEmails,
                }
              : null,
          }
        : null,
      payments: data.payments.map((payment) => ({
        id: payment.id.toString(),
        amount: payment.amount,
        points: payment.points,
        createdAt: payment.createdAt.toISOString(),
      })),
      achievements: data.unlockedAchievements,
    };
  }
}
