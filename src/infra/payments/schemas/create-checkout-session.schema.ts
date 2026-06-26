import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreateCheckoutSessionBodySchema = z.object({
  amountInCents: z
    .number()
    .int('Amount must be an integer.')
    .min(100, 'Amount must be at least 100 cents ($1.00).'),
});

const CreateCheckoutSessionResponseSchema = z.object({
  checkoutUrl: z.string().url(),
});

export class CreateCheckoutSessionBodyDto extends createZodDto(
  CreateCheckoutSessionBodySchema,
) {}

export class CreateCheckoutSessionResponseDto extends createZodDto(
  CreateCheckoutSessionResponseSchema,
) {}
