import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { PrivacySettings } from '../entities/privacy-settings.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';

export type UpdatePrivacySettingsUseCaseRequest = {
  requesterId: string;
  publicProfile?: boolean;
  showTotalPaid?: boolean;
  showAchievements?: boolean;
  showActivity?: boolean;
};

export type UpdatePrivacySettingsUseCaseResult = Either<
  ResourceNotFoundError,
  { privacySettings: PrivacySettings }
>;

@Injectable()
export class UpdatePrivacySettingsUseCase implements UseCase<
  UpdatePrivacySettingsUseCaseRequest,
  UpdatePrivacySettingsUseCaseResult
> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(
    params: UpdatePrivacySettingsUseCaseRequest,
  ): Promise<UpdatePrivacySettingsUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(
      new UniqueEntityID(params.requesterId),
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found'));
    }

    const current = profile.privacySettings;

    const updated = PrivacySettings.create(
      {
        profileId: profile.id,
        publicProfile: params.publicProfile ?? current?.publicProfile ?? true,
        showTotalPaid: params.showTotalPaid ?? current?.showTotalPaid ?? true,
        showAchievements:
          params.showAchievements ?? current?.showAchievements ?? true,
        showActivity: params.showActivity ?? current?.showActivity ?? true,
      },
      current?.id,
    );

    profile.setPrivacySettings(updated);
    await this.profilesRepository.savePrivacySettings(profile);

    return success({ privacySettings: updated });
  }
}
