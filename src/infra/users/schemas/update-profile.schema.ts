import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdateProfileBodySchema = z.object({
  displayName: z.string().trim().min(1).max(100).optional(),
  bio: z
    .string()
    .trim()
    .max(280, 'Bio must be at most 280 characters.')
    .optional(),
  country: z
    .string()
    .trim()
    .toUpperCase()
    .length(2, 'Country must be a 2-letter ISO 3166-1 alpha-2 code.')
    .optional()
    .or(z.literal('').optional()),
  avatarUrl: z.url('Invalid avatar URL.').nullable().optional(),
});

export class UpdateProfileBodyDto extends createZodDto(
  UpdateProfileBodySchema,
) {}
