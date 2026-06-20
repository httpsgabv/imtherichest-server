import {
  Controller,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { NotAllowedError } from '#core/errors/errors/not-allowed.error.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { GetPublicUserAchievementsUseCase } from '#domain/achievements/use-cases/get-public-user-achievements.use-case.js';
import { AchievementPresenter } from '../presenters/achievement.presenter.js';
import { UsernameParamDto } from '../schemas/get-public-achievements.schema.js';
import { UserAchievementsResponseDto } from '../schemas/achievements-response.schema.js';

@ApiTags('Achievements')
@Controller({
  path: 'users',
  version: '1',
})
export class GetPublicUserAchievementsController {
  constructor(
    private readonly getPublicUserAchievementsUseCase: GetPublicUserAchievementsUseCase,
  ) {}

  @Get(':username/achievements')
  @AllowAnonymous()
  @ApiOperation({ summary: "Get a public user's unlocked achievements" })
  @ApiOkResponse({
    description: 'Achievements returned.',
    type: UserAchievementsResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'User has disabled achievement visibility.',
    type: ErrorResponseDto,
  })
  @ApiParam({ name: 'username', type: String })
  async handle(@Param() params: UsernameParamDto) {
    const result = await this.getPublicUserAchievementsUseCase.execute({
      username: params.username,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      if (result.value instanceof NotAllowedError) {
        throw new ForbiddenException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    return {
      unlockedIds: result.value.unlockedIds,
      definitions: result.value.definitions.map(AchievementPresenter.present),
    };
  }
}
