import { Injectable } from '@nestjs/common';
import type { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import type { UserAchievement } from '#domain/achievements/entities/user-achievement.js';
import { AchievementsRepository } from '#domain/achievements/repositories/achievements-repository.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';

@Injectable()
export class PrismaAchievementsRepository extends AchievementsRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findUnlockedIdsByProfileId(
    profileId: UniqueEntityID,
  ): Promise<string[]> {
    const rows = await this.prisma.userAchievement.findMany({
      where: { profileId: profileId.toString() },
      select: { achievementId: true },
    });

    return rows.map((row) => row.achievementId);
  }

  async deleteByProfileId(profileId: UniqueEntityID): Promise<void> {
    await this.prisma.userAchievement.deleteMany({
      where: { profileId: profileId.toString() },
    });
  }

  async createMany(achievements: UserAchievement[]): Promise<void> {
    if (achievements.length === 0) return;

    await this.prisma.userAchievement.createMany({
      data: achievements.map((achievement) => ({
        id: achievement.id.toString(),
        profileId: achievement.profileId.toString(),
        achievementId: achievement.achievementId,
        unlockedAt: achievement.unlockedAt,
      })),
      skipDuplicates: true,
    });
  }
}
