import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const LeaderboardUserSchema = z.object({
  rank: z.number().int(),
  username: z.string(),
  displayName: z.string().nullable(),
  points: z.number().int(),
  totalPaid: z.number().nullable(),
  country: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  achievements: z.array(z.string()),
});

const LeaderboardResponseSchema = z.object({
  users: z.array(LeaderboardUserSchema),
  total: z.number().int(),
  nextCursor: z.number().int().nullable(),
});

const UserRankResponseSchema = z.object({
  rank: z.number().int(),
  points: z.number().int(),
  nextRivalDelta: z.number().int().nullable(),
});

export class LeaderboardUserDto extends createZodDto(LeaderboardUserSchema) {}

export class LeaderboardResponseDto extends createZodDto(
  LeaderboardResponseSchema,
) {}

export class UserRankResponseDto extends createZodDto(UserRankResponseSchema) {}
