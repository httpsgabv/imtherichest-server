import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const PaymentSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().int(),
  points: z.number().int(),
  createdAt: z.string().datetime(),
});

const CreatePaymentResponseSchema = z.object({
  payment: PaymentSchema,
  profile: z.object({
    points: z.number().int(),
    totalPaid: z.number().int(),
    rank: z.number().int(),
  }),
  unlockedAchievements: z.array(z.string()),
});

const PaymentsResponseSchema = z.object({
  payments: z.array(PaymentSchema),
  nextCursor: z.string().nullable(),
});

export class PaymentDto extends createZodDto(PaymentSchema) {}

export class CreatePaymentResponseDto extends createZodDto(
  CreatePaymentResponseSchema,
) {}

export class PaymentsResponseDto extends createZodDto(PaymentsResponseSchema) {}
