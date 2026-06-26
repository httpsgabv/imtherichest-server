import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction): void {
    const chunks: Buffer[] = [];

    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });

    req.on('end', () => {
      const rawBody = Buffer.concat(chunks);
      (req as RequestWithRawBody).rawBody = rawBody;
      // Prevent body-parser from re-consuming the already-read stream
      (req as Request & { _body: boolean }).body = rawBody;
      (req as Request & { _body: boolean })._body = true;
      next();
    });

    req.on('error', next);
  }
}
