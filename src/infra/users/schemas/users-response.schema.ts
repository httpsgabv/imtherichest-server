import { createZodDto } from 'nestjs-zod';
import z from 'zod';

const PrivacySettingsSchema = z.object({
  publicProfile: z.boolean(),
  showTotalPaid: z.boolean(),
  showAchievements: z.boolean(),
  showActivity: z.boolean(),
});

const NotificationSettingsSchema = z.object({
  achievementAlerts: z.boolean(),
  rankAlerts: z.boolean(),
  paymentConfirmations: z.boolean(),
  marketingEmails: z.boolean(),
});

const ProfileResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  username: z.string(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  country: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  points: z.number().int(),
  totalPaid: z.number().int(),
  privacySettings: PrivacySettingsSchema.nullable(),
  notificationSettings: NotificationSettingsSchema.nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
});

const PublicProfileResponseSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  displayName: z.string().nullable(),
  bio: z.string().nullable(),
  country: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  points: z.number().int(),
  totalPaid: z.number().int().nullable(),
  rank: z.number().int(),
  isOwner: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().nullable(),
  privacySettings: PrivacySettingsSchema.nullable(),
});

export class PrivacySettingsDto extends createZodDto(PrivacySettingsSchema) {}

export class NotificationSettingsDto extends createZodDto(
  NotificationSettingsSchema,
) {}

export class ProfileResponseDto extends createZodDto(ProfileResponseSchema) {}

export class PublicProfileResponseDto extends createZodDto(
  PublicProfileResponseSchema,
) {}
