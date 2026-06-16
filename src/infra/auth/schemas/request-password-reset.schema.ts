import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const RequestPasswordResetBodySchema = z.object({
  email: z.email('Email is invalid.').trim().toLowerCase(),

  redirectTo: z.url('redirectTo must be a valid URL.').optional(),
});

export class RequestPasswordResetBodyDto extends createZodDto(
  RequestPasswordResetBodySchema,
) {}
