import { Injectable } from '@nestjs/common';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import type { PrivacySettings } from '../entities/privacy-settings.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';

export type GetPrivacySettingsUseCaseRequest = {
  requesterId: string;
};

export type GetPrivacySettingsUseCaseResult = Either<
  ResourceNotFoundError,
  { privacySettings: PrivacySettings }
>;

@Injectable()
export class GetPrivacySettingsUseCase implements UseCase<
  GetPrivacySettingsUseCaseRequest,
  GetPrivacySettingsUseCaseResult
> {
  constructor(private readonly profilesRepository: ProfilesRepository) {}

  async execute(
    params: GetPrivacySettingsUseCaseRequest,
  ): Promise<GetPrivacySettingsUseCaseResult> {
    const profile = await this.profilesRepository.findByUserId(
      new UniqueEntityID(params.requesterId),
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('Profile not found'));
    }

    if (!profile.privacySettings) {
      return failure(new ResourceNotFoundError('Privacy settings not found'));
    }

    return success({ privacySettings: profile.privacySettings });
  }
}
