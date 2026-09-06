export const EmployeeStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TERMINATED: 'TERMINATED',
} as const;
export type EmployeeStatus = (typeof EmployeeStatus)[keyof typeof EmployeeStatus];

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  HOURLY: 'HOURLY',
  CONTRACTOR: 'CONTRACTOR',
} as const;
export type EmploymentType = (typeof EmploymentType)[keyof typeof EmploymentType];

export const SystemLinkStatus = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  ERROR: 'ERROR',
} as const;
export type SystemLinkStatus = (typeof SystemLinkStatus)[keyof typeof SystemLinkStatus];

export const AttendanceMethod = {
  APP: 'APP',
  PHONE: 'PHONE',
  CLOCK: 'CLOCK',
  MANUAL: 'MANUAL',
  NONE: 'NONE',
} as const;
export type AttendanceMethod = (typeof AttendanceMethod)[keyof typeof AttendanceMethod];

export const AttendanceStatus = {
  OK: 'OK',
  MISSING_IN: 'MISSING_IN',
  MISSING_OUT: 'MISSING_OUT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type AttendanceStatus = (typeof AttendanceStatus)[keyof typeof AttendanceStatus];

export const AttendanceSource = {
  APP: 'APP',
  PHONE: 'PHONE',
  CLOCK: 'CLOCK',
  MANUAL: 'MANUAL',
  TEMP_EMPLOYEE: 'TEMP_EMPLOYEE',
} as const;
export type AttendanceSource = (typeof AttendanceSource)[keyof typeof AttendanceSource];

export const ExceptionType = {
  MISSING_IN: 'MISSING_IN',
  MISSING_OUT: 'MISSING_OUT',
  MANUAL_CORRECTION: 'MANUAL_CORRECTION',
  LATE_ENTRY: 'LATE_ENTRY',
  OVERLAPPING: 'OVERLAPPING',
  MANAGER_APPROVAL_REQUIRED: 'MANAGER_APPROVAL_REQUIRED',
} as const;
export type ExceptionType = (typeof ExceptionType)[keyof typeof ExceptionType];

export const ExceptionStatus = {
  OPEN: 'OPEN',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ExceptionStatus = (typeof ExceptionStatus)[keyof typeof ExceptionStatus];

// TODO - confirm actual onboarding workflow with HR
export const OnboardingStepStatus = {
  REQUESTED: 'REQUESTED',
  HR_REVIEW: 'HR_REVIEW',
  MISSING_DOCUMENTS: 'MISSING_DOCUMENTS',
  DOCUMENTS_COMPLETE: 'DOCUMENTS_COMPLETE',
  PAYROLL_SETUP: 'PAYROLL_SETUP',
  ATTENDANCE_ACTIVATED: 'ATTENDANCE_ACTIVATED',
  ACTIVE: 'ACTIVE',
} as const;
export type OnboardingStepStatus = (typeof OnboardingStepStatus)[keyof typeof OnboardingStepStatus];

export const UserRole = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  HR_REFERENT: 'HR_REFERENT',
  PAYROLL: 'PAYROLL',
  HR_MANAGER: 'HR_MANAGER',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
