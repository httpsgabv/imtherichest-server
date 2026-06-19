import type { Prisma } from '#generated/prisma/client.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Profile } from '#domain/users/entities/profile.js';
import { PrivacySettings } from '#domain/users/entities/privacy-settings.js';
import { NotificationSettings } from '#domain/users/entities/notification-settings.js';

type ProfileWithSettings = Prisma.ProfileGetPayload<{
  include: { privacySettings: true; notificationSettings: true };
}>;

export class PrismaProfileMapper {
  static toDomain(raw: ProfileWithSettings): Profile {
    return Profile.create(
      {
        userId: new UniqueEntityID(raw.userId),
        username: raw.username,
        displayName: raw.displayName,
        bio: raw.bio,
        country: raw.country,
        avatarUrl: raw.avatarUrl,
        points: raw.points,
        totalPaid: raw.totalPaid,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        privacySettings: raw.privacySettings
          ? PrivacySettings.create(
              {
                profileId: new UniqueEntityID(raw.privacySettings.profileId),
                publicProfile: raw.privacySettings.publicProfile,
                showTotalPaid: raw.privacySettings.showTotalPaid,
                showAchievements: raw.privacySettings.showAchievements,
                showActivity: raw.privacySettings.showActivity,
              },
              new UniqueEntityID(raw.privacySettings.id),
            )
          : null,
        notificationSettings: raw.notificationSettings
          ? NotificationSettings.create(
              {
                profileId: new UniqueEntityID(
                  raw.notificationSettings.profileId,
                ),
                achievementAlerts: raw.notificationSettings.achievementAlerts,
                rankAlerts: raw.notificationSettings.rankAlerts,
                paymentConfirmations:
                  raw.notificationSettings.paymentConfirmations,
                marketingEmails: raw.notificationSettings.marketingEmails,
              },
              new UniqueEntityID(raw.notificationSettings.id),
            )
          : null,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(profile: Profile): Prisma.ProfileUncheckedCreateInput {
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
            create: {
              id: profile.privacySettings.id.toString(),
              publicProfile: profile.privacySettings.publicProfile,
              showTotalPaid: profile.privacySettings.showTotalPaid,
              showAchievements: profile.privacySettings.showAchievements,
              showActivity: profile.privacySettings.showActivity,
            },
          }
        : undefined,
      notificationSettings: profile.notificationSettings
        ? {
            create: {
              id: profile.notificationSettings.id.toString(),
              achievementAlerts: profile.notificationSettings.achievementAlerts,
              rankAlerts: profile.notificationSettings.rankAlerts,
              paymentConfirmations:
                profile.notificationSettings.paymentConfirmations,
              marketingEmails: profile.notificationSettings.marketingEmails,
            },
          }
        : undefined,
    };
  }
}
