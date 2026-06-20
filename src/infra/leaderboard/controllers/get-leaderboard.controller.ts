import { Controller, Get, Query } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetLeaderboardUseCase } from '#domain/leaderboard/use-cases/get-leaderboard.use-case.js';
import { LeaderboardUserPresenter } from '../presenters/leaderboard-user.presenter.js';
import { GetLeaderboardQueryDto } from '../schemas/get-leaderboard.schema.js';
import { LeaderboardResponseDto } from '../schemas/leaderboard-response.schema.js';

@ApiTags('Leaderboard')
@Controller({
  path: 'leaderboard',
  version: '1',
})
export class GetLeaderboardController {
  constructor(private readonly getLeaderboardUseCase: GetLeaderboardUseCase) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'Get the global leaderboard ranked by points' })
  @ApiOkResponse({
    description: 'Leaderboard returned successfully.',
    type: LeaderboardResponseDto,
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async handle(
    @Query() query: GetLeaderboardQueryDto,
  ): Promise<LeaderboardResponseDto> {
    const result = await this.getLeaderboardUseCase.execute({
      limit: query.limit,
      cursor: query.cursor,
      search: query.search,
    });

    const { entries, total, nextCursor } = result.value;

    return {
      users: entries.map(LeaderboardUserPresenter.present),
      total,
      nextCursor,
    };
  }
}
