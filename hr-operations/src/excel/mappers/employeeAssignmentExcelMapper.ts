import type { EmployeeAssignment } from '../../types/entities';
import { bool, str, strOrNull } from '../mapperUtils';

export function rowToEmployeeAssignment(row: Record<string, unknown>): EmployeeAssignment {
  return {
    id: str(row.id),
    employeeId: str(row.employeeId),
    departmentId: str(row.departmentId),
    unitId: str(row.unitId),
    managerId: strOrNull(row.managerId),
    roleTitle: str(row.roleTitle),
    isPrimary: bool(row.isPrimary),
    startDate: str(row.startDate),
    endDate: strOrNull(row.endDate),
  };
}

export function employeeAssignmentToRow(assignment: EmployeeAssignment): Record<string, unknown> {
  return { ...assignment, managerId: assignment.managerId ?? '', endDate: assignment.endDate ?? '' };
}
