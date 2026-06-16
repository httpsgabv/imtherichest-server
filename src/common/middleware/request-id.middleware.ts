import { Injectable, type NestMiddleware } from '@nestjs/common';

import { randomUUID } from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '#common/constants/request-id.constants.js';

export interface RequestWithId extends Request {
  requestId: string;
}

function normalizeRequestId(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > 128) {
    return null;
  }

  return trimmed;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction): void {
    const incomingRequestId = normalizeRequestId(
      request.headers[REQUEST_ID_HEADER],
    );

    const requestId = incomingRequestId ?? randomUUID();

    request.headers[REQUEST_ID_HEADER] = requestId;
    response.setHeader(REQUEST_ID_HEADER, requestId);

    (request as RequestWithId).requestId = requestId;

    next();
  }
}
