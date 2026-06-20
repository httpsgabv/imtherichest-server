import { Module } from '@nestjs/common';
import { AchievementsRepository } from '#domain/achievements/repositories/achievements-repository.js';
import { PaymentsRepository } from '#domain/payments/repositories/payments-repository.js';
import { LeaderboardRepository } from '#domain/leaderboard/repositories/leaderboard-repository.js';
import { UsersRepository } from '#domain/users/repositories/users-repository.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { DeleteUserUseCase } from '#domain/users/use-cases/delete-user.use-case.js';
import { ExportUserDataUseCase } from '#domain/users/use-cases/export-user-data.use-case.js';
import { CreateProfileUseCase } from '#domain/users/use-cases/create-profile.use-case.js';
import { GetMyProfileUseCase } from '#domain/users/use-cases/get-my-profile.use-case.js';
import { GetProfileByUsernameUseCase } from '#domain/users/use-cases/get-profile-by-username.use-case.js';
import { UpdateProfileUseCase } from '#domain/users/use-cases/update-profile.use-case.js';
import { GetPrivacySettingsUseCase } from '#domain/users/use-cases/get-privacy-settings.use-case.js';
import { UpdatePrivacySettingsUseCase } from '#domain/users/use-cases/update-privacy-settings.use-case.js';
import { GetNotificationSettingsUseCase } from '#domain/users/use-cases/get-notification-settings.use-case.js';
import { UpdateNotificationSettingsUseCase } from '#domain/users/use-cases/update-notification-settings.use-case.js';
import { AchievementsModule } from '#infra/achievements/achievements.module.js';
import { DatabaseModule } from '#infra/database/database.module.js';
import { PrismaAchievementsRepository } from '#infra/achievements/repositories/prisma-achievements.repository.js';
import { PrismaLeaderboardRepository } from '#infra/leaderboard/repositories/prisma-leaderboard.repository.js';
import { PrismaPaymentsRepository } from '#infra/payments/repositories/prisma-payments.repository.js';
import { DeleteUserController } from './controllers/delete-user.controller.js';
import { ExportUserDataController } from './controllers/export-user-data.controller.js';
import { GetMyProfileController } from './controllers/get-my-profile.controller.js';
import { GetProfileByUsernameController } from './controllers/get-profile-by-username.controller.js';
import { UpdateProfileController } from './controllers/update-profile.controller.js';
import { GetPrivacySettingsController } from './controllers/get-privacy-settings.controller.js';
import { UpdatePrivacySettingsController } from './controllers/update-privacy-settings.controller.js';
import { GetNotificationSettingsController } from './controllers/get-notification-settings.controller.js';
import { UpdateNotificationSettingsController } from './controllers/update-notification-settings.controller.js';
import { PrismaUsersRepository } from './repositories/prisma-users.repository.js';
import { PrismaProfilesRepository } from './repositories/prisma-profiles.repository.js';

@Module({
  imports: [DatabaseModule, AchievementsModule],
  controllers: [
    DeleteUserController,
    ExportUserDataController,
    GetMyProfileController,
    UpdateProfileController,
    GetPrivacySettingsController,
    UpdatePrivacySettingsController,
    GetNotificationSettingsController,
    UpdateNotificationSettingsController,
    // Registered last so static `users/me*` routes match before `users/:username`.
    GetProfileByUsernameController,
  ],
  providers: [
    DeleteUserUseCase,
    ExportUserDataUseCase,
    CreateProfileUseCase,
    GetMyProfileUseCase,
    GetProfileByUsernameUseCase,
    UpdateProfileUseCase,
    GetPrivacySettingsUseCase,
    UpdatePrivacySettingsUseCase,
    GetNotificationSettingsUseCase,
    UpdateNotificationSettingsUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    {
      provide: ProfilesRepository,
      useClass: PrismaProfilesRepository,
    },
    {
      provide: AchievementsRepository,
      useClass: PrismaAchievementsRepository,
    },
    {
      provide: PaymentsRepository,
      useClass: PrismaPaymentsRepository,
    },
    {
      provide: LeaderboardRepository,
      useClass: PrismaLeaderboardRepository,
    },
  ],
  exports: [CreateProfileUseCase, ProfilesRepository],
})
export class UsersModule {}
