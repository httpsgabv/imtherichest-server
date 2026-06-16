import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { Response } from 'express';
import type { RequestWithId } from '#common/middleware/request-id.middleware.js';
import { buildErrorResponse } from './build-error-response.js';

type ExceptionResponseBody = {
  code?: string;
  message?: string | string[];
  error?: string;
  issues?: unknown;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeExceptionResponse(response: unknown): ExceptionResponseBody {
  if (typeof response === 'string') {
    return {
      message: response,
    };
  }

  if (isObject(response)) {
    return response as ExceptionResponseBody;
  }

  return {
    message: 'Unexpected error',
  };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const request = ctx.getRequest<RequestWithId>();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;

    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? normalizeExceptionResponse(exception.getResponse())
      : {
          message: 'Internal server error',
        };

    if (statusCode >= 500) {
      const exceptionType =
        exception instanceof Error
          ? exception.constructor.name
          : 'UnknownError';
      const exceptionMessage =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(
        `${request.method} ${request.originalUrl} → ${statusCode} [${exceptionType}]: ${exceptionMessage}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(statusCode).json(
      buildErrorResponse(request, response, {
        statusCode,
        code: exceptionResponse.code ?? this.getDefaultErrorCode(statusCode),
        message:
          exceptionResponse.message ?? this.getDefaultErrorMessage(statusCode),
        error: exceptionResponse.error,
        issues: exceptionResponse.issues,
      }),
    );
  }

  private getDefaultErrorCode(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'BAD_REQUEST';
      case HttpStatus.UNAUTHORIZED:
        return 'UNAUTHORIZED';
      case HttpStatus.FORBIDDEN:
        return 'FORBIDDEN';
      case HttpStatus.NOT_FOUND:
        return 'NOT_FOUND';
      case HttpStatus.CONFLICT:
        return 'CONFLICT';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'UNPROCESSABLE_ENTITY';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_SERVER_ERROR';
    }
  }

  private getDefaultErrorMessage(statusCode: number): string {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad request';
      case HttpStatus.UNAUTHORIZED:
        return 'Unauthorized';
      case HttpStatus.FORBIDDEN:
        return 'Forbidden';
      case HttpStatus.NOT_FOUND:
        return 'Resource not found';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return 'Unprocessable entity';
      case HttpStatus.TOO_MANY_REQUESTS:
        return 'Too many requests';
      default:
        return 'Internal server error';
    }
  }
}
