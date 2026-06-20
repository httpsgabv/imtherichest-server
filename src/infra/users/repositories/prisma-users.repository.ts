import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { User } from '#domain/users/entities/user.js';
import {
  UsersRepository,
  type UserExportData,
} from '#domain/users/repositories/users-repository.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';
import { PrismaPaymentMapper } from '#infra/payments/mappers/prisma-payment.mapper.js';
import { PrismaProfileMapper } from '#infra/users/mappers/prisma-profile.mapper.js';

@Injectable()
export class PrismaUsersRepository extends UsersRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });

    if (!row) {
      return null;
    }

    return User.create(
      {
        name: row.name,
        email: row.email,
        emailVerified: row.emailVerified,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      new UniqueEntityID(row.id),
    );
  }

  async findByIdWithAllData(id: string): Promise<UserExportData | null> {
    const row = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: {
          include: {
            privacySettings: true,
            notificationSettings: true,
            payments: { orderBy: { createdAt: 'desc' } },
            achievements: true,
          },
        },
      },
    });

    if (!row) return null;

    const user = User.create(
      {
        name: row.name,
        email: row.email,
        emailVerified: row.emailVerified,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
      new UniqueEntityID(row.id),
    );

    const profile = row.profile
      ? PrismaProfileMapper.toDomain(row.profile)
      : null;
    const payments =
      row.profile?.payments.map(PrismaPaymentMapper.toDomain) ?? [];
    const unlockedAchievements =
      row.profile?.achievements.map((a) => a.achievementId) ?? [];

    return { user, profile, payments, unlockedAchievements };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
