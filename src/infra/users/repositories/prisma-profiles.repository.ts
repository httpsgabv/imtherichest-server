import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Profile } from '#domain/users/entities/profile.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';
import { PrismaProfileMapper } from '../mappers/prisma-profile.mapper.js';

@Injectable()
export class PrismaProfilesRepository extends ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: UniqueEntityID): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({
      where: { userId: userId.toString() },
      include: { privacySettings: true, notificationSettings: true },
    });

    if (!row) return null;

    return PrismaProfileMapper.toDomain(row);
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({
      where: { username },
      include: { privacySettings: true, notificationSettings: true },
    });

    if (!row) return null;

    return PrismaProfileMapper.toDomain(row);
  }

  async create(profile: Profile): Promise<void> {
    await this.prisma.profile.create({
      data: PrismaProfileMapper.toPrisma(profile),
    });
  }

  async save(profile: Profile): Promise<void> {
    await this.prisma.profile.update({
      where: { id: profile.id.toString() },
      data: {
        displayName: profile.displayName,
        bio: profile.bio,
        country: profile.country,
        avatarUrl: profile.avatarUrl,
        updatedAt: profile.updatedAt ?? new Date(),
      },
    });
  }

  async savePrivacySettings(profile: Profile): Promise<void> {
    const settings = profile.privacySettings;
    if (!settings) return;

    await this.prisma.privacySettings.upsert({
      where: { profileId: profile.id.toString() },
      update: {
        publicProfile: settings.publicProfile,
        showTotalPaid: settings.showTotalPaid,
        showAchievements: settings.showAchievements,
        showActivity: settings.showActivity,
      },
      create: {
        id: settings.id.toString(),
        profileId: profile.id.toString(),
        publicProfile: settings.publicProfile,
        showTotalPaid: settings.showTotalPaid,
        showAchievements: settings.showAchievements,
        showActivity: settings.showActivity,
      },
    });
  }

  async saveNotificationSettings(profile: Profile): Promise<void> {
    const settings = profile.notificationSettings;
    if (!settings) return;

    await this.prisma.notificationSettings.upsert({
      where: { profileId: profile.id.toString() },
      update: {
        achievementAlerts: settings.achievementAlerts,
        rankAlerts: settings.rankAlerts,
        paymentConfirmations: settings.paymentConfirmations,
        marketingEmails: settings.marketingEmails,
      },
      create: {
        id: settings.id.toString(),
        profileId: profile.id.toString(),
        achievementAlerts: settings.achievementAlerts,
        rankAlerts: settings.rankAlerts,
        paymentConfirmations: settings.paymentConfirmations,
        marketingEmails: settings.marketingEmails,
      },
    });
  }

  async savePoints(profile: Profile): Promise<void> {
    await this.prisma.profile.update({
      where: { id: profile.id.toString() },
      data: {
        points: profile.points,
        totalPaid: profile.totalPaid,
        updatedAt: profile.updatedAt ?? new Date(),
      },
    });
  }
}
