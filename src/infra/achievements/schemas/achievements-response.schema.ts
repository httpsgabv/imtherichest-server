import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const AchievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.enum(['normal', 'weird', 'meme']),
});

const AchievementsResponseSchema = z.object({
  achievements: z.array(AchievementSchema),
});

const UserAchievementsResponseSchema = z.object({
  unlockedIds: z.array(z.string()),
  definitions: z.array(AchievementSchema),
});

export class AchievementDto extends createZodDto(AchievementSchema) {}

export class AchievementsResponseDto extends createZodDto(
  AchievementsResponseSchema,
) {}

export class UserAchievementsResponseDto extends createZodDto(
  UserAchievementsResponseSchema,
) {}
