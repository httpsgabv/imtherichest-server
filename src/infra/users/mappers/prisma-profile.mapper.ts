import type { Prisma } from '#generated/prisma/client.js';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Profile } from '#domain/users/entities/profile.js';
import { PrivacySettings } from '#domain/users/entities/privacy-settings.js';

type ProfileWithPrivacySettings = Prisma.ProfileGetPayload<{
  include: { privacySettings: true };
}>;

export class PrismaProfileMapper {
  static toDomain(raw: ProfileWithPrivacySettings): Profile {
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
    };
  }
}
