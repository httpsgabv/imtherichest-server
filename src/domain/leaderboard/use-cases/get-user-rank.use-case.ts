import { Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import type { UseCase } from '#core/use-cases/use-case.js';
import { failure, success, type Either } from '#core/utils/either.js';
import { ProfilesRepository } from '#domain/users/repositories/profiles-repository.js';
import { LeaderboardRepository } from '../repositories/leaderboard-repository.js';

export type GetUserRankUseCaseRequest = {
  username: string;
};

export type GetUserRankUseCaseResult = Either<
  ResourceNotFoundError,
  { rank: number; points: number; nextRivalDelta: number | null }
>;

@Injectable()
export class GetUserRankUseCase implements UseCase<
  GetUserRankUseCaseRequest,
  GetUserRankUseCaseResult
> {
  constructor(
    private readonly profilesRepository: ProfilesRepository,
    private readonly leaderboardRepository: LeaderboardRepository,
  ) {}

  async execute(
    params: GetUserRankUseCaseRequest,
  ): Promise<GetUserRankUseCaseResult> {
    const profile = await this.profilesRepository.findByUsername(
      params.username,
    );

    if (!profile) {
      return failure(new ResourceNotFoundError('User not found.'));
    }

    const [rank, nextRivalDelta] = await Promise.all([
      this.leaderboardRepository.getProfileRank(profile.id),
      this.leaderboardRepository.getNextRivalDelta(profile.id),
    ]);

    return success({ rank, points: profile.points, nextRivalDelta });
  }
}
