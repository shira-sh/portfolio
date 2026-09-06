import type {
  AttendanceMethod,
  AttendanceSource,
  AttendanceStatus,
  EmployeeStatus,
  EmploymentType,
  ExceptionStatus,
  ExceptionType,
  OnboardingStepStatus,
  SystemLinkStatus,
  UserRole,
} from './enums';

export interface Employee {
  id: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  roleTitle: string;
  primaryDepartmentId: string;
  primaryUnitId: string;
  primaryManagerId: string | null;
  startDate: string;
  endDate: string | null;
  attendanceMethod: AttendanceMethod;
  hrSystemStatus: SystemLinkStatus;
  payrollSystemStatus: SystemLinkStatus;
  attendanceSystemStatus: SystemLinkStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAssignment {
  id: string;
  employeeId: string;
  departmentId: string;
  unitId: string;
  managerId: string | null;
  roleTitle: string;
  isPrimary: boolean;
  startDate: string;
  endDate: string | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  isActive: boolean;
}

export interface Unit {
  id: string;
  departmentId: string;
  name: string;
  code: string;
  address: string | null;
  isActive: boolean;
}

export interface Permission {
  action: string;
  allowedRoles: UserRole[];
}

export interface User {
  id: string;
  employeeId: string | null;
  displayName: string;
  role: UserRole;
  scopeDepartmentIds: string[];
  isActive: boolean;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  workedMinutes: number | null;
  status: AttendanceStatus;
  source: AttendanceSource;
  unitId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceException {
  id: string;
  employeeId: string;
  attendanceRecordId: string | null;
  type: ExceptionType;
  status: ExceptionStatus;
  requestedChange: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

export interface OnboardingRequest {
  id: string;
  employeeId: string;
  currentStep: OnboardingStepStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface OnboardingStep {
  id: string;
  onboardingRequestId: string;
  step: OnboardingStepStatus;
  completedAt: string | null;
  completedBy: string | null;
  notes: string | null;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  userDisplayName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
}

export interface SystemStatus {
  totalEmployees: number;
  pendingEmployees: number;
  attendanceExceptions: number;
  pendingApprovals: number;
}

export interface FileConnectionStatus {
  fileName: string | null;
  isConnected: boolean;
  lastLoadedAt: string | null;
  rowCounts: Record<string, number>;
  canWriteDirectly: boolean;
}
