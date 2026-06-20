import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CreatePaymentBodySchema = z.object({
  amountInCents: z
    .number()
    .int('Amount must be an integer.')
    .min(100, 'Amount must be at least 100 cents ($1.00).'),
});

export class CreatePaymentBodyDto extends createZodDto(
  CreatePaymentBodySchema,
) {}
