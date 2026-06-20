import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AllowAnonymous } from '@thallesp/nestjs-better-auth';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { GetUserRankUseCase } from '#domain/leaderboard/use-cases/get-user-rank.use-case.js';
import { UsernameParamDto } from '../schemas/get-leaderboard.schema.js';

@ApiTags('Leaderboard')
@Controller({
  path: 'users',
  version: '1',
})
export class GetUserRankController {
  constructor(private readonly getUserRankUseCase: GetUserRankUseCase) {}

  @Get(':username/rank')
  @AllowAnonymous()
  @ApiOperation({ summary: "Get a user's global rank and rival delta" })
  @ApiOkResponse({ description: 'Rank returned successfully.' })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiParam({ name: 'username', type: String })
  async handle(@Param() params: UsernameParamDto) {
    const result = await this.getUserRankUseCase.execute({
      username: params.username,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    return result.value;
  }
}
