import type {
  AttendanceException,
  AttendanceRecord,
  AuditEvent,
  Department,
  Employee,
  EmployeeAssignment,
  OnboardingRequest,
  OnboardingStep,
  Unit,
  User,
} from './entities';

export const SHEET_NAMES = {
  Employees: 'Employees',
  EmployeeAssignments: 'EmployeeAssignments',
  Departments: 'Departments',
  Units: 'Units',
  Attendance: 'Attendance',
  AttendanceExceptions: 'AttendanceExceptions',
  Onboarding: 'Onboarding',
  OnboardingSteps: 'OnboardingSteps',
  Users: 'Users',
  AuditLog: 'AuditLog',
} as const;

export type SheetName = (typeof SHEET_NAMES)[keyof typeof SHEET_NAMES];

/** In-memory representation of the whole HR_DEMO.xlsx workbook. This is the single object
 * that the Excel adapter reads from / writes to disk; repositories operate on it in memory
 * and persist it back through the adapter. */
export interface Database {
  employees: Employee[];
  employeeAssignments: EmployeeAssignment[];
  departments: Department[];
  units: Unit[];
  attendance: AttendanceRecord[];
  attendanceExceptions: AttendanceException[];
  onboardingRequests: OnboardingRequest[];
  onboardingSteps: OnboardingStep[];
  users: User[];
  auditLog: AuditEvent[];
}

export function createEmptyDatabase(): Database {
  return {
    employees: [],
    employeeAssignments: [],
    departments: [],
    units: [],
    attendance: [],
    attendanceExceptions: [],
    onboardingRequests: [],
    onboardingSteps: [],
    users: [],
    auditLog: [],
  };
}
