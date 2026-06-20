import { Injectable } from '@nestjs/common';
import type { UseCase } from '#core/use-cases/use-case.js';
import { success, type Either } from '#core/utils/either.js';
import {
  LeaderboardRepository,
  type GetLeaderboardResult,
} from '../repositories/leaderboard-repository.js';

export type GetLeaderboardUseCaseRequest = {
  limit?: number;
  cursor?: number;
  search?: string;
};

export type GetLeaderboardUseCaseResult = Either<never, GetLeaderboardResult>;

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 200;

@Injectable()
export class GetLeaderboardUseCase implements UseCase<
  GetLeaderboardUseCaseRequest,
  GetLeaderboardUseCaseResult
> {
  constructor(private readonly leaderboardRepository: LeaderboardRepository) {}

  async execute(
    params: GetLeaderboardUseCaseRequest,
  ): Promise<GetLeaderboardUseCaseResult> {
    const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const result = await this.leaderboardRepository.getLeaderboard({
      limit,
      cursor: params.cursor,
      search: params.search,
    });

    return success(result);
  }
}
