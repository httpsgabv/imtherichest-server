import {
  BadRequestException,
  Injectable,
  type ArgumentMetadata,
} from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const BaseValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) => {
    if (error instanceof ZodError) {
      return new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        issues: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      });
    }

    return new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
    });
  },
  strictSchemaDeclaration: true,
});

@Injectable()
export class AppZodValidationPipe extends BaseValidationPipe {
  override transform(value: unknown, metadata: ArgumentMetadata): unknown {
    if (metadata.type === 'custom') return value;
    return super.transform(value, metadata);
  }
}
