import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Patch,
} from '@nestjs/common';
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
import { UpdatePrivacySettingsUseCase } from '#domain/users/use-cases/update-privacy-settings.use-case.js';
import { UpdatePrivacySettingsBodyDto } from '../schemas/update-privacy-settings.schema.js';
import { PrivacySettingsDto } from '../schemas/users-response.schema.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UpdatePrivacySettingsController {
  constructor(
    private readonly updatePrivacySettingsUseCase: UpdatePrivacySettingsUseCase,
  ) {}

  @Patch('me/settings/privacy')
  @ApiOperation({
    summary: "Update the authenticated user's privacy settings",
  })
  @ApiBody({ type: UpdatePrivacySettingsBodyDto })
  @ApiOkResponse({
    description: 'Privacy settings updated successfully.',
    type: PrivacySettingsDto,
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
    @Body() body: UpdatePrivacySettingsBodyDto,
  ) {
    const result = await this.updatePrivacySettingsUseCase.execute({
      requesterId: session.user.id,
      publicProfile: body.publicProfile,
      showTotalPaid: body.showTotalPaid,
      showAchievements: body.showAchievements,
      showActivity: body.showActivity,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    const { privacySettings } = result.value;

    return {
      publicProfile: privacySettings.publicProfile,
      showTotalPaid: privacySettings.showTotalPaid,
      showAchievements: privacySettings.showAchievements,
      showActivity: privacySettings.showActivity,
    };
  }
}
