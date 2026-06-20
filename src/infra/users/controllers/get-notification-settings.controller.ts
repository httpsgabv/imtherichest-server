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
import { GetNotificationSettingsUseCase } from '#domain/users/use-cases/get-notification-settings.use-case.js';
import { NotificationSettingsDto } from '../schemas/users-response.schema.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class GetNotificationSettingsController {
  constructor(
    private readonly getNotificationSettingsUseCase: GetNotificationSettingsUseCase,
  ) {}

  @Get('me/settings/notifications')
  @ApiOperation({
    summary: "Get the authenticated user's notification settings",
  })
  @ApiOkResponse({
    description: 'Notification settings returned successfully.',
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
  async handle(@Session() session: UserSession) {
    const result = await this.getNotificationSettingsUseCase.execute({
      requesterId: session.user.id,
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
