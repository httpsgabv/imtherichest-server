import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { GetAchievementsUseCase } from '#domain/achievements/use-cases/get-achievements.use-case.js';
import { AchievementPresenter } from '../presenters/achievement.presenter.js';
import { AchievementsResponseDto } from '../schemas/achievements-response.schema.js';

@ApiTags('Achievements')
@Controller({
  path: 'achievements',
  version: '1',
})
export class GetAchievementsController {
  constructor(
    private readonly getAchievementsUseCase: GetAchievementsUseCase,
  ) {}

  @Get()
  @AllowAnonymous()
  @ApiOperation({ summary: 'List all achievement definitions' })
  @ApiOkResponse({
    description: 'Achievement definitions returned.',
    type: AchievementsResponseDto,
  })
  async handle() {
    const result = await this.getAchievementsUseCase.execute();

    return {
      achievements: result.achievements.map(AchievementPresenter.present),
    };
  }
}
