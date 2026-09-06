import type { Employee } from '../../types/entities';
import type {
  AttendanceMethod,
  EmployeeStatus,
  EmploymentType,
  SystemLinkStatus,
} from '../../types/enums';
import { str, strOrNull } from '../mapperUtils';

export function rowToEmployee(row: Record<string, unknown>): Employee {
  return {
    id: str(row.id),
    nationalId: str(row.nationalId),
    firstName: str(row.firstName),
    lastName: str(row.lastName),
    phone: str(row.phone),
    email: str(row.email),
    status: str(row.status) as EmployeeStatus,
    employmentType: str(row.employmentType) as EmploymentType,
    roleTitle: str(row.roleTitle),
    primaryDepartmentId: str(row.primaryDepartmentId),
    primaryUnitId: str(row.primaryUnitId),
    primaryManagerId: strOrNull(row.primaryManagerId),
    startDate: str(row.startDate),
    endDate: strOrNull(row.endDate),
    attendanceMethod: str(row.attendanceMethod) as AttendanceMethod,
    hrSystemStatus: str(row.hrSystemStatus) as SystemLinkStatus,
    payrollSystemStatus: str(row.payrollSystemStatus) as SystemLinkStatus,
    attendanceSystemStatus: str(row.attendanceSystemStatus) as SystemLinkStatus,
    notes: str(row.notes),
    createdAt: str(row.createdAt),
    updatedAt: str(row.updatedAt),
  };
}

export function employeeToRow(employee: Employee): Record<string, unknown> {
  return { ...employee, primaryManagerId: employee.primaryManagerId ?? '', endDate: employee.endDate ?? '' };
}
