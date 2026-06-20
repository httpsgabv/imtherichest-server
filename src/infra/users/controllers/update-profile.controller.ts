import { Body, Controller, NotFoundException, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '#common/swagger/error-response.schema.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { UpdateProfileUseCase } from '#domain/users/use-cases/update-profile.use-case.js';
import { ProfilePresenter } from '../presenters/profile.presenter.js';
import { UpdateProfileBodyDto } from '../schemas/update-profile.schema.js';
import { ProfileResponseDto } from '../schemas/users-response.schema.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UpdateProfileController {
  constructor(private readonly updateProfileUseCase: UpdateProfileUseCase) {}

  @Patch('me/profile')
  @ApiOperation({ summary: "Update the authenticated user's profile" })
  @ApiBody({ type: UpdateProfileBodyDto })
  @ApiOkResponse({
    description: 'Profile updated successfully.',
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
  @ApiBadRequestResponse({
    description: 'Request body failed validation.',
    type: ValidationErrorResponseDto,
  })
  async handle(
    @Session() session: UserSession,
    @Body() body: UpdateProfileBodyDto,
  ) {
    const result = await this.updateProfileUseCase.execute({
      requesterId: session.user.id,
      displayName: body.displayName,
      bio: body.bio,
      country: body.country,
      avatarUrl: body.avatarUrl,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
    }

    return ProfilePresenter.present((result.value as any).profile);
  }
}
