import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdatePasswordBodySchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required.')
    .max(128, 'Current password must have at most 128 characters.'),

  newPassword: z
    .string()
    .min(8, 'New password must have at least 8 characters.')
    .max(128, 'New password must have at most 128 characters.'),

  revokeOtherSessions: z.boolean().optional(),
});

export class UpdatePasswordBodyDto extends createZodDto(
  UpdatePasswordBodySchema,
) {}
