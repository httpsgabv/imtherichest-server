import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const SignUpWithEmailBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(80, 'Name must have at most 80 characters.'),

  email: z.email('Email is invalid.').trim().toLowerCase(),

  password: z
    .string()
    .min(8, 'Password must have at least 8 characters.')
    .max(128, 'Password must have at most 128 characters.'),
});

export class SignUpWithEmailBodyDto extends createZodDto(
  SignUpWithEmailBodySchema,
) {}

export const SignUpWithEmailResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().nullable().optional(),
  }),
});

export class SignUpWithEmailResponseDto extends createZodDto(
  SignUpWithEmailResponseSchema,
) {}
