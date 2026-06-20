import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { GetPrivacySettingsUseCase } from '#domain/users/use-cases/get-privacy-settings.use-case.js';
import { PrivacySettingsDto } from '../schemas/users-response.schema.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class GetPrivacySettingsController {
  constructor(
    private readonly getPrivacySettingsUseCase: GetPrivacySettingsUseCase,
  ) {}

  @Get('me/settings/privacy')
  @ApiOperation({ summary: "Get the authenticated user's privacy settings" })
  @ApiOkResponse({
    description: 'Privacy settings returned successfully.',
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
  async handle(@Session() session: UserSession) {
    const result = await this.getPrivacySettingsUseCase.execute({
      requesterId: session.user.id,
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
