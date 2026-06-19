import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdatePrivacySettingsBodySchema = z.object({
  publicProfile: z.boolean().optional(),
  showTotalPaid: z.boolean().optional(),
  showAchievements: z.boolean().optional(),
  showActivity: z.boolean().optional(),
});

export class UpdatePrivacySettingsBodyDto extends createZodDto(
  UpdatePrivacySettingsBodySchema,
) {}
