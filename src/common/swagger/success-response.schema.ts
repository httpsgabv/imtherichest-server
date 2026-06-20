import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const SuccessResponseSchema = z.object({
  success: z.literal(true),
});

export class SuccessResponseDto extends createZodDto(SuccessResponseSchema) {}
