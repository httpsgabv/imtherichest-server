import type { User } from '../entities/user.js';

export type UserExportData = {
  user: User;
};

export abstract class UsersRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByIdWithAllData(id: string): Promise<UserExportData | null>;
  abstract delete(id: string): Promise<void>;
}
