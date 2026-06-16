import type { User } from '#domain/users/entities/user.js';
import {
  UsersRepository,
  type UserExportData,
} from '#domain/users/repositories/users-repository.js';

export class InMemoryUsersRepository extends UsersRepository {
  public items: User[] = [];
  public exportData: Map<string, UserExportData> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findByIdWithAllData(id: string): Promise<UserExportData | null> {
    return this.exportData.get(id) ?? null;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
