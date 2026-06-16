import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const SignInWithEmailBodySchema = z.object({
  email: z.email('Email is invalid.').trim().toLowerCase(),

  password: z
    .string()
    .min(1, 'Password is required.')
    .max(128, 'Password must have at most 128 characters.'),
});

export class SignInWithEmailBodyDto extends createZodDto(
  SignInWithEmailBodySchema,
) {}

export const SignInWithEmailResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    emailVerified: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().nullable().optional(),
  }),
});

export class SignInWithEmailResponseDto extends createZodDto(
  SignInWithEmailResponseSchema,
) {}
