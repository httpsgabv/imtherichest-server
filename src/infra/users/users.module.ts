import { Module } from '@nestjs/common';
import { UsersRepository } from '#domain/users/repositories/users-repository.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { DeleteUserUseCase } from '#domain/users/use-cases/delete-user.use-case.js';
import { ExportUserDataUseCase } from '#domain/users/use-cases/export-user-data.use-case.js';
import { CreateProfileUseCase } from '#domain/users/use-cases/create-profile.use-case.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { DeleteUserController } from './controllers/delete-user.controller.js';
import { ExportUserDataController } from './controllers/export-user-data.controller.js';
import { PrismaUsersRepository } from './repositories/prisma-users.repository.js';
import { PrismaProfilesRepository } from './repositories/prisma-profiles.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [DeleteUserController, ExportUserDataController],
  providers: [
    DeleteUserUseCase,
    ExportUserDataUseCase,
    CreateProfileUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: ProfilesRepository,
      useClass: PrismaProfilesRepository,
    },
  ],
  exports: [CreateProfileUseCase],
})
export class UsersModule {}
