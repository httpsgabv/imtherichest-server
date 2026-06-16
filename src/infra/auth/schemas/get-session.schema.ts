import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const GetSessionResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().nullable().optional(),
  }),
  session: z.object({
    id: z.string(),
    expiresAt: z.string().datetime(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    ipAddress: z.string().nullable().optional(),
    userAgent: z.string().nullable().optional(),
  }),
});

export class GetSessionResponseDto extends createZodDto(
  GetSessionResponseSchema,
) {}
