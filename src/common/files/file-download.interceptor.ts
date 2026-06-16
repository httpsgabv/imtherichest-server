import {
  Injectable,
  StreamableFile,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { FileDownload } from './file-download.js';

@Injectable()
export class FileDownloadInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value: unknown) => {
        if (!(value instanceof FileDownload)) {
          return value;
        }

        const content =
          typeof value.content === 'string'
            ? Buffer.from(value.content)
            : value.content;

        return new StreamableFile(content, {
          type: value.mimeType,
          disposition: `attachment; filename="${value.filename}"`,
        });
      }),
    );
  }
}
