import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { NotificationSettings } from '../entities/notification-settings.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';

export type GetNotificationSettingsUseCaseRequest = {
  requesterId: string;
};

export type GetNotificationSettingsUseCaseResult = Either<
  ResourceNotFoundError,
  { notificationSettings: NotificationSettings }
>;

@Injectable()
export class GetNotificationSettingsUseCase implements UseCase<
  GetNotificationSettingsUseCaseRequest,
  GetNotificationSettingsUseCaseResult
> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(
    params: GetNotificationSettingsUseCaseRequest,
  ): Promise<GetNotificationSettingsUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(
      new UniqueEntityID(params.requesterId),
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found'));
    }

    if (!profile.notificationSettings) {
      return failure(
        new ResourceNotFoundError('Notification settings not found'),
      );
    }

    return success({ notificationSettings: profile.notificationSettings });
  }
}
