import type { Employee, EmployeeAssignment, User } from '../types/entities';
import { UserRole } from '../types/enums';

/** Central permission policies. Nothing in the UI should check `user.role === 'X'`
 * directly - every access decision goes through one of these functions instead. */

function isManagerOf(user: User, employee: Employee, assignments: EmployeeAssignment[]): boolean {
  if (!user.employeeId) return false;
  if (employee.primaryManagerId === user.employeeId) return true;
  return assignments.some((a) => a.managerId === user.employeeId);
}

function isInHrScope(user: User, employee: Employee, assignments: EmployeeAssignment[]): boolean {
  if (user.scopeDepartmentIds.length === 0) return true; // empty scope = organization-wide
  if (user.scopeDepartmentIds.includes(employee.primaryDepartmentId)) return true;
  return assignments.some((a) => user.scopeDepartmentIds.includes(a.departmentId));
}

function isSelf(user: User, employee: Employee): boolean {
  return user.employeeId === employee.id;
}

export function canViewEmployee(
  user: User,
  employee: Employee,
  assignments: EmployeeAssignment[] = [],
): boolean {
  switch (user.role) {
    case UserRole.EMPLOYEE:
      return isSelf(user, employee);
    case UserRole.MANAGER:
      return isManagerOf(user, employee, assignments);
    case UserRole.HR_REFERENT:
      return isInHrScope(user, employee, assignments);
    case UserRole.PAYROLL:
    case UserRole.HR_MANAGER:
    case UserRole.SYSTEM_ADMIN:
      return true;
    default:
      return false;
  }
}

export function canEditEmployee(
  user: User,
  employee: Employee,
  assignments: EmployeeAssignment[] = [],
): boolean {
  switch (user.role) {
    case UserRole.HR_REFERENT:
      return isInHrScope(user, employee, assignments);
    case UserRole.HR_MANAGER:
    case UserRole.SYSTEM_ADMIN:
      return true;
    default:
      return false;
  }
}

export function canViewAttendance(
  user: User,
  employee: Employee,
  assignments: EmployeeAssignment[] = [],
): boolean {
  switch (user.role) {
    case UserRole.EMPLOYEE:
      return isSelf(user, employee);
    case UserRole.MANAGER:
      return isManagerOf(user, employee, assignments);
    case UserRole.HR_REFERENT:
      return isInHrScope(user, employee, assignments);
    case UserRole.PAYROLL:
    case UserRole.HR_MANAGER:
    case UserRole.SYSTEM_ADMIN:
      return true;
    default:
      return false;
  }
}

export function canReportOwnAttendance(user: User, employee: Employee): boolean {
  return (user.role === UserRole.EMPLOYEE || user.role === UserRole.MANAGER) && isSelf(user, employee);
}

export function canApproveAttendanceExceptions(
  user: User,
  employee: Employee,
  assignments: EmployeeAssignment[] = [],
): boolean {
  switch (user.role) {
    case UserRole.MANAGER:
      return isManagerOf(user, employee, assignments);
    case UserRole.HR_REFERENT:
      return isInHrScope(user, employee, assignments);
    case UserRole.HR_MANAGER:
    case UserRole.SYSTEM_ADMIN:
      return true;
    default:
      return false;
  }
}

export function canCreateEmployee(user: User): boolean {
  return (
    user.role === UserRole.MANAGER ||
    user.role === UserRole.HR_REFERENT ||
    user.role === UserRole.HR_MANAGER ||
    user.role === UserRole.SYSTEM_ADMIN
  );
}

export function canApproveNewEmployeeForAttendance(
  user: User,
  employee: Employee,
  assignments: EmployeeAssignment[] = [],
): boolean {
  return user.role === UserRole.SYSTEM_ADMIN || user.role === UserRole.HR_MANAGER || isManagerOf(user, employee, assignments);
}

export function canUpdateOnboardingStatus(
  user: User,
  employee: Employee,
  assignments: EmployeeAssignment[] = [],
): boolean {
  switch (user.role) {
    case UserRole.HR_REFERENT:
      return isInHrScope(user, employee, assignments);
    case UserRole.PAYROLL:
      return true; // limited to the payroll step - enforced at the service/UI level
    case UserRole.HR_MANAGER:
    case UserRole.SYSTEM_ADMIN:
      return true;
    default:
      return false;
  }
}

export function canViewPayrollStatus(user: User): boolean {
  return (
    user.role === UserRole.PAYROLL || user.role === UserRole.HR_MANAGER || user.role === UserRole.SYSTEM_ADMIN
  );
}

export function canViewOrgStructure(user: User): boolean {
  return user.role !== UserRole.EMPLOYEE;
}

export function canImportExport(user: User): boolean {
  return (
    user.role === UserRole.HR_REFERENT ||
    user.role === UserRole.HR_MANAGER ||
    user.role === UserRole.SYSTEM_ADMIN
  );
}

export function canViewAuditLog(user: User): boolean {
  return user.role === UserRole.HR_MANAGER || user.role === UserRole.SYSTEM_ADMIN;
}

export function canManageUsers(user: User): boolean {
  return user.role === UserRole.SYSTEM_ADMIN;
}

export function canViewDashboard(user: User): boolean {
  return user.role === UserRole.HR_REFERENT || user.role === UserRole.HR_MANAGER || user.role === UserRole.SYSTEM_ADMIN;
}

export function canViewManagerDashboard(user: User): boolean {
  return user.role === UserRole.MANAGER;
}
