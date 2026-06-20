import {
  Controller,
  Get,
  NotFoundException,
  UseInterceptors,
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
import { FileDownload } from '#common/files/file-download.js';
import { FileDownloadInterceptor } from '#common/files/file-download.interceptor.js';
import { ErrorResponseDto } from '#common/swagger/error-response.schema.js';
import { ExportUserDataUseCase } from '#domain/users/use-cases/export-user-data.use-case.js';
import { UserExportDataPresenter } from '../presenters/user-export-data.presenter.js';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class ExportUserDataController {
  constructor(private readonly exportUserDataUseCase: ExportUserDataUseCase) {}

  @Get('me/export')
  @UseInterceptors(FileDownloadInterceptor)
  @ApiOperation({
    summary: 'Export all data for the authenticated user as JSON',
  })
  @ApiOkResponse({
    description: 'User data exported as a JSON file.',
    schema: { type: 'string', format: 'binary' },
    headers: {
      'Content-Disposition': {
        description: 'attachment; filename="user-data.json"',
        schema: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required.',
    type: ErrorResponseDto,
  })
  async handle(@Session() session: UserSession): Promise<FileDownload> {
    const result = await this.exportUserDataUseCase.execute({
      requesterId: session.user.id,
    });

    if (result.isFailure()) {
      throw new NotFoundException(result.value.message);
    }

    return new FileDownload(
      'user-data.json',
      'application/json',
      JSON.stringify(UserExportDataPresenter.present(result.value), null, 2),
    );
  }
}
