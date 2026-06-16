import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const ErrorResponseSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),
  message: z.string(),
  error: z.string().optional(),
  requestId: z.uuid().optional(),
  timestamp: z.iso.datetime(),
  path: z.string(),
  method: z.string(),
});

const ValidationErrorResponseSchema = ErrorResponseSchema.extend({
  issues: z
    .array(
      z.object({
        path: z.string(),
        message: z.string(),
        code: z.string(),
      }),
    )
    .optional(),
});

export class ErrorResponseDto extends createZodDto(ErrorResponseSchema) {}

export class ValidationErrorResponseDto extends createZodDto(
  ValidationErrorResponseSchema,
) {}
