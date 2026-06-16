import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { ResourceNotFoundError } from '#core/errors/errors/resource-not-found.error.js';
import { DeleteUserUseCase } from '#domain/users/use-cases/delete-user.use-case.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class DeleteUserController {
  constructor(private readonly deleteUserUseCase: DeleteUserUseCase) {}

  @Delete('me')
  @HttpCode(204)
  @ApiOperation({
    summary:
      'Delete the authenticated user and cascade all related application data',
  })
  @ApiNoContentResponse({ description: 'User deleted successfully.' })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
    type: ErrorResponseDto,
  })
  async handle(@Session() session: UserSession): Promise<void> {
    const result = await this.deleteUserUseCase.execute({
      requesterId: session.user.id,
    });

    if (result.isFailure()) {
      if (result.value instanceof ResourceNotFoundError) {
        throw new NotFoundException(result.value.message);
      }
    }
  }
}
