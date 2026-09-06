import { userRepository } from '../repositories';
import type { User } from '../types/entities';

/** Demo authentication only - see spec section 15. There is no real login; the user
 * picks one of the predefined demo accounts seeded into the Users sheet. */
export async function getDemoUsers(): Promise<User[]> {
  const users = await userRepository.getAll();
  return users.filter((u) => u.isActive);
}

export async function getUserById(id: string): Promise<User | null> {
  return userRepository.getById(id);
}
