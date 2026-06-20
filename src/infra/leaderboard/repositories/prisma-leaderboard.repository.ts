import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import {
  LeaderboardRepository,
  type GetLeaderboardParams,
  type GetLeaderboardResult,
} from '#domain/leaderboard/repositories/leaderboard-repository.js';
import { PrismaProfileMapper } from '#infra/users/mappers/prisma-profile.mapper.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';

@Injectable()
export class PrismaLeaderboardRepository extends LeaderboardRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async getProfileRank(profileId: UniqueEntityID): Promise<number> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId.toString() },
      select: { points: true },
    });

    if (!profile) return 1;

    const ahead = await this.prisma.profile.count({
      where: { points: { gt: profile.points } },
    });

    return ahead + 1;
  }

  async getNextRivalDelta(profileId: UniqueEntityID): Promise<number | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId.toString() },
      select: { points: true },
    });

    if (!profile) return null;

    const rival = await this.prisma.profile.findFirst({
      where: { points: { gt: profile.points } },
      orderBy: { points: 'asc' },
      select: { points: true },
    });

    if (!rival) return null;

    return rival.points - profile.points;
  }

  async getLeaderboard(
    params: GetLeaderboardParams,
  ): Promise<GetLeaderboardResult> {
    const skip = params.cursor ?? 0;
    const { limit, search } = params;

    const searchFilter = search
      ? {
          OR: [
            {
              username: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              displayName: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const where = {
      privacySettings: { publicProfile: true },
      ...searchFilter,
    };

    const [total, rows] = await this.prisma.$transaction([
      this.prisma.profile.count({ where }),
      this.prisma.profile.findMany({
        where,
        include: { privacySettings: true, notificationSettings: true },
        orderBy: { points: 'desc' },
        skip,
        take: limit + 1,
      }),
    ]);

    const hasMore = rows.length > limit;
    const pageRows = rows.slice(0, limit);

    const entries = await Promise.all(
      pageRows.map(async (row) => {
        const profile = PrismaProfileMapper.toDomain(row);
        const rank = await this.getProfileRank(profile.id);
        return {
          profile,
          rank,
          // TODO: fetch unlockedAchievementIds from achievements domain when built
          unlockedAchievementIds: [] as string[],
        };
      }),
    );

    return {
      entries,
      total,
      nextCursor: hasMore ? skip + limit : null,
    };
  }
}
