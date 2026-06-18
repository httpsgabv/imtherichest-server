import {
  Catch,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { Response } from 'express';
import type { RequestWithId } from '#common/middleware/request-id.middleware.js';
import { DomainError } from '#core/errors/domain.error.js';
import { buildErrorResponse } from './build-error-response.js';

const HTTP_STATUS_BY_CODE: Record<string, number> = {
  EMAIL_ALREADY_IN_USE: HttpStatus.CONFLICT,
  USERNAME_ALREADY_TAKEN: HttpStatus.CONFLICT,
  AUTH_PROVIDER_ERROR: HttpStatus.BAD_GATEWAY,
  INVALID_CREDENTIALS: HttpStatus.UNAUTHORIZED,
  SESSION_NOT_FOUND: HttpStatus.UNAUTHORIZED,
  INVALID_PASSWORD: HttpStatus.UNAUTHORIZED,
  RESOURCE_NOT_FOUND: HttpStatus.NOT_FOUND,
  NOT_ALLOWED: HttpStatus.FORBIDDEN,
};

@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();

    const statusCode =
      HTTP_STATUS_BY_CODE[exception.code] ?? HttpStatus.INTERNAL_SERVER_ERROR;

    if (statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} failed with ${statusCode}: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(statusCode).json(
      buildErrorResponse(request, response, {
        statusCode,
        code: exception.code,
        message: exception.message,
      }),
    );
  }
}
