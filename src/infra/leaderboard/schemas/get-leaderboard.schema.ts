import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const GetLeaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.coerce.number().int().min(0).optional(),
  search: z.string().max(100).optional(),
});

export class GetLeaderboardQueryDto extends createZodDto(
  GetLeaderboardQuerySchema,
) {}

export const UsernameParamSchema = z.object({
  username: z.string().min(2).max(30),
});

export class UsernameParamDto extends createZodDto(UsernameParamSchema) {}
