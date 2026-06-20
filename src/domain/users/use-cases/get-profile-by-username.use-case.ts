import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { failure, success, type Either } from '#core/utils/either.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { LeaderboardRepository } from '#domain/leaderboard/repositories/leaderboard-repository.js';
import type { Profile } from '../entities/profile.js';
import { ProfilesRepository } from '../repositories/profiles-repository.js';

export type GetProfileByUsernameUseCaseRequest = {
  username: string;
  /** Authenticated caller's user id, if any. Enables the owner bypass. */
  requesterId?: string;
};

export type GetProfileByUsernameUseCaseResult = Either<
  ResourceNotFoundError,
  { profile: Profile; rank: number; isOwner: boolean }
>;

@Injectable()
export class GetProfileByUsernameUseCase implements UseCase<
  GetProfileByUsernameUseCaseRequest,
  GetProfileByUsernameUseCaseResult
> {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly leaderboardRepository: LeaderboardRepository,
  ) {}

  async execute(
    params: GetProfileByUsernameUseCaseRequest,
  ): Promise<GetProfileByUsernameUseCaseResult> {
    const profile = await this.profilesRepository.findByUsername(
      params.username,
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('User not found.'));
    }

    const isOwner =
      !!params.requesterId && profile.userId.toString() === params.requesterId;

    // Hide non-public profiles from everyone except their owner.
    if (!isOwner && profile.privacySettings?.publicProfile === false) {
      return failure(new ResourceNotFoundError('User not found.'));
    }

    const rank = await this.leaderboardRepository.getProfileRank(profile.id);

    return success({ profile, rank, isOwner });
  }
}
