import { Module } from '@nestjs/common';
import { UsersRepository } from '#domain/users/repositories/users-repository.js';
import { DeleteUserUseCase } from '#domain/users/use-cases/delete-user.use-case.js';
import { ExportUserDataUseCase } from '#domain/users/use-cases/export-user-data.use-case.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { DeleteUserController } from './controllers/delete-user.controller.js';
import { ExportUserDataController } from './controllers/export-user-data.controller.js';
import { PrismaUsersRepository } from './repositories/prisma-users.repository.js';

@Module({
  imports: [DatabaseModule],
  controllers: [DeleteUserController, ExportUserDataController],
  providers: [
    DeleteUserUseCase,
    ExportUserDataUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
})
export class UsersModule {}
