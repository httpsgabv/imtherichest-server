import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const GetPaymentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

export class GetPaymentsQueryDto extends createZodDto(GetPaymentsQuerySchema) {}

export const GetPublicPaymentsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(8).optional(),
  cursor: z.string().optional(),
});

export class GetPublicPaymentsQueryDto extends createZodDto(
  GetPublicPaymentsQuerySchema,
) {}

export const UsernameParamSchema = z.object({
  username: z.string().min(2).max(30),
});

export class UsernameParamDto extends createZodDto(UsernameParamSchema) {}
