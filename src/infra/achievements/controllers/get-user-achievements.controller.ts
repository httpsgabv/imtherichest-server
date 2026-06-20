import { Controller, Get } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UniqueEntityID } from '#core/entities/unique-entity-id.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { GetUserAchievementsUseCase } from '#domain/achievements/use-cases/get-user-achievements.use-case.js';
import { AchievementPresenter } from '../presenters/achievement.presenter.js';
import { UserAchievementsResponseDto } from '../schemas/achievements-response.schema.js';

@ApiTags('Achievements')
@Controller({
  path: 'users',
  version: '1',
})
export class GetUserAchievementsController {
  constructor(
    private readonly getUserAchievementsUseCase: GetUserAchievementsUseCase,
  ) {}

  @Get('me/achievements')
  @ApiOperation({
    summary: "Get the authenticated user's unlocked achievements",
  })
  @ApiOkResponse({
    description: 'Achievements returned.',
    type: UserAchievementsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
    type: ErrorResponseDto,
  })
  async handle(@Session() session: UserSession) {
    const result = await this.getUserAchievementsUseCase.execute({
      userId: new UniqueEntityID(session.user.id),
    });

    return {
      unlockedIds: result.unlockedIds,
      definitions: result.definitions.map(AchievementPresenter.present),
    };
  }
}
