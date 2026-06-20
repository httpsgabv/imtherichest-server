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
import { UpdateNotificationSettingsUseCase } from '#domain/users/use-cases/update-notification-settings.use-case.js';
import { UpdateNotificationSettingsBodyDto } from '../schemas/update-notification-settings.schema.js';
import { NotificationSettingsDto } from '../schemas/users-response.schema.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UpdateNotificationSettingsController {
  constructor(
    private readonly updateNotificationSettingsUseCase: UpdateNotificationSettingsUseCase,
  ) {}

  @Patch('me/settings/notifications')
  @ApiOperation({
    summary: "Update the authenticated user's notification settings",
  })
  @ApiBody({ type: UpdateNotificationSettingsBodyDto })
  @ApiOkResponse({
    description: 'Notification settings updated successfully.',
    type: NotificationSettingsDto,
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
    @Body() body: UpdateNotificationSettingsBodyDto,
  ) {
    const result = await this.updateNotificationSettingsUseCase.execute({
      requesterId: session.user.id,
      achievementAlerts: body.achievementAlerts,
      rankAlerts: body.rankAlerts,
      paymentConfirmations: body.paymentConfirmations,
      marketingEmails: body.marketingEmails,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
      throw new InternalServerErrorException();
    }

    const { notificationSettings } = result.value;

    return {
      achievementAlerts: notificationSettings.achievementAlerts,
      rankAlerts: notificationSettings.rankAlerts,
      paymentConfirmations: notificationSettings.paymentConfirmations,
      marketingEmails: notificationSettings.marketingEmails,
    };
  }
}
