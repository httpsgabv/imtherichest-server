import { REQUEST_ID_HEADER } from '#common/constants/request-id.constants.js';
import type { RequestWithId } from '#common/middleware/request-id.middleware.js';
import type { Response } from 'express';

type BuildErrorResponseOptions = {
  statusCode: number;
  code: string;
  message: string | string[];
  error?: string;
  issues?: unknown;
};

export function buildErrorResponse(
  request: RequestWithId,
  response: Response,
  options: BuildErrorResponseOptions,
) {
  const requestId =
    request.requestId ??
    request.headers[REQUEST_ID_HEADER]?.toString() ??
    response.getHeader(REQUEST_ID_HEADER)?.toString();

  return {
    statusCode: options.statusCode,
    code: options.code,
    message: options.message,
    error: options.error,
    issues: options.issues,
    requestId,
    timestamp: new Date().toISOString(),
    path: request.originalUrl,
    method: request.method,
  };
}
