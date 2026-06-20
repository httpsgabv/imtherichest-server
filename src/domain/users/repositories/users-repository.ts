import type { Payment } from '#domain/payments/entities/payment.js';
import type { Profile } from '../entities/profile.js';
import type { User } from '../entities/user.js';

export type UserExportData = {
  user: User;
  profile: Profile | null;
  payments: Payment[];
  unlockedAchievements: string[];
};

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByIdWithAllData(id: string): Promise<UserExportData | null>;
  abstract delete(id: string): Promise<void>;
}
