import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const UpdateNotificationSettingsBodySchema = z.object({
  achievementAlerts: z.boolean().optional(),
  rankAlerts: z.boolean().optional(),
  paymentConfirmations: z.boolean().optional(),
  marketingEmails: z.boolean().optional(),
});

export class UpdateNotificationSettingsBodyDto extends createZodDto(
  UpdateNotificationSettingsBodySchema,
) {}
