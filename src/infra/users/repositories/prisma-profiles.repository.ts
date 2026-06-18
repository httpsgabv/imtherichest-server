import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { Profile } from '#domain/users/entities/profile.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';

@Injectable()
export class PrismaProfilesRepository extends ProfilesRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: UniqueEntityID): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({
      where: { userId: userId.toString() },
    });

    if (!row) return null;

    return Profile.create(
      {
        userId: new UniqueEntityID(row.userId),
        username: row.username,
        displayName: row.displayName,
        bio: row.bio,
        country: row.country,
        avatarUrl: row.avatarUrl,
        points: row.points,
        totalPaid: row.totalPaid,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      new UniqueEntityID(row.id),
    );
  }

  async findByUsername(username: string): Promise<Profile | null> {
    const row = await this.prisma.profile.findUnique({ where: { username } });

    if (!row) return null;

    return Profile.create(
      {
        userId: new UniqueEntityID(row.userId),
        username: row.username,
        displayName: row.displayName,
        bio: row.bio,
        country: row.country,
        avatarUrl: row.avatarUrl,
        points: row.points,
        totalPaid: row.totalPaid,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      new UniqueEntityID(row.id),
    );
  }

  async create(profile: Profile): Promise<void> {
    await this.prisma.profile.create({
      data: {
        id: profile.id.toString(),
        userId: profile.userId.toString(),
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        country: profile.country,
        avatarUrl: profile.avatarUrl,
        points: profile.points,
        totalPaid: profile.totalPaid,
      },
    });
  }
}
