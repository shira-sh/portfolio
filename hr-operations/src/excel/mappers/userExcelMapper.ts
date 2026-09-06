import type { User } from '../../types/entities';
import type { UserRole } from '../../types/enums';
import { arrayToCsv, bool, csvToArray, str, strOrNull } from '../mapperUtils';

export function rowToUser(row: Record<string, unknown>): User {
  return {
    id: str(row.id),
    employeeId: strOrNull(row.employeeId),
    displayName: str(row.displayName),
    role: str(row.role) as UserRole,
    scopeDepartmentIds: csvToArray(row.scopeDepartmentIds),
    isActive: bool(row.isActive),
  };
}

export function userToRow(user: User): Record<string, unknown> {
  return {
    ...user,
    employeeId: user.employeeId ?? '',
    scopeDepartmentIds: arrayToCsv(user.scopeDepartmentIds),
  };
}
