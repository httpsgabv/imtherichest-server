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
import { AllowAnonymous, Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { GetProfileByUsernameUseCase } from '#domain/users/use-cases/get-profile-by-username.use-case.js';
import { PublicProfilePresenter } from '../presenters/public-profile.presenter.js';
import { UsernameParamDto } from '../schemas/get-profile-by-username.schema.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class GetProfileByUsernameController {
  constructor(
    private readonly getProfileByUsernameUseCase: GetProfileByUsernameUseCase,
  ) {}

  @Get(':username')
  @AllowAnonymous()
  @ApiOperation({ summary: "Get a user's public profile by username" })
  @ApiOkResponse({ description: 'Profile returned successfully.' })
  @ApiNotFoundResponse({
    description: 'User not found or profile is private.',
    type: ErrorResponseDto,
  })
  @ApiParam({ name: 'username', type: String })
  async handle(
    @Param() params: UsernameParamDto,
    @Session() session: UserSession | null,
  ) {
    const result = await this.getProfileByUsernameUseCase.execute({
      username: params.username,
      requesterId: session?.user?.id,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    return PublicProfilePresenter.present(result.value);
  }
}
