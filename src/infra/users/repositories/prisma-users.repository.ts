import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { User } from '#domain/users/entities/user.js';
import {
  UsersRepository,
  type UserExportData,
} from '#domain/users/repositories/users-repository.js';
import { PrismaService } from '#infra/database/prisma/prisma.service.js';

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
    });

    if (!row) return null;

    return {
      user: User.create(
        {
          name: row.name,
          email: row.email,
          emailVerified: row.emailVerified,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
        },
        new UniqueEntityID(row.id),
      ),
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }
}
