import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { NotificationSettings } from '../entities/notification-settings.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';

export type UpdateNotificationSettingsUseCaseRequest = {
  requesterId: string;
  achievementAlerts?: boolean;
  rankAlerts?: boolean;
  paymentConfirmations?: boolean;
  marketingEmails?: boolean;
};

export type UpdateNotificationSettingsUseCaseResult = Either<
  ResourceNotFoundError,
  { notificationSettings: NotificationSettings }
>;

@Injectable()
export class UpdateNotificationSettingsUseCase implements UseCase<
  UpdateNotificationSettingsUseCaseRequest,
  UpdateNotificationSettingsUseCaseResult
> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(
    params: UpdateNotificationSettingsUseCaseRequest,
  ): Promise<UpdateNotificationSettingsUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(
      new UniqueEntityID(params.requesterId),
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found'));
    }

    const current = profile.notificationSettings;

    const updated = NotificationSettings.create(
      {
        profileId: profile.id,
        achievementAlerts:
          params.achievementAlerts ?? current?.achievementAlerts ?? true,
        rankAlerts: params.rankAlerts ?? current?.rankAlerts ?? true,
        paymentConfirmations:
          params.paymentConfirmations ?? current?.paymentConfirmations ?? true,
        marketingEmails:
          params.marketingEmails ?? current?.marketingEmails ?? false,
      },
      current?.id,
    );

    profile.setNotificationSettings(updated);
    await this.profilesRepository.saveNotificationSettings(profile);

    return success({ notificationSettings: updated });
  }
}
