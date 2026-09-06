import type { UserRepository } from '../contracts/UserRepository';
import type { User } from '../../types/entities';
import { getDatabase } from '../../excel/dbState';

export class ExcelUserRepository implements UserRepository {
  async getAll(): Promise<User[]> {
    return [...getDatabase().users];
  }

  async getById(id: string): Promise<User | null> {
    return getDatabase().users.find((u) => u.id === id) ?? null;
  }
}
