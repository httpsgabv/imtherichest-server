import { Controller, Get, NotFoundException } from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { GetMyProfileUseCase } from '#domain/users/use-cases/get-my-profile.use-case.js';
import { ProfilePresenter } from '../presenters/profile.presenter.js';
import { ProfileResponseDto } from '../schemas/users-response.schema.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class GetMyProfileController {
  constructor(private readonly getMyProfileUseCase: GetMyProfileUseCase) {}

  @Get('me')
  @ApiOperation({ summary: 'Get the full profile of the authenticated user' })
  @ApiOkResponse({
    description: 'Profile returned successfully.',
    type: ProfileResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Profile not found.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
    type: ErrorResponseDto,
  })
  async handle(@Session() session: UserSession) {
    const result = await this.getMyProfileUseCase.execute({
      requesterId: session.user.id,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
    }

    return ProfilePresenter.present((result.value as any).profile);
  }
}
