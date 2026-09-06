import {
  AttendanceStatus,
  EmployeeStatus,
  EmploymentType,
  ExceptionStatus,
  ExceptionType,
  OnboardingStepStatus,
  SystemLinkStatus,
  UserRole,
} from '../types/enums';

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  PENDING: 'ממתין לקליטה',
  ACTIVE: 'פעיל',
  INACTIVE: 'לא פעיל',
  SUSPENDED: 'מושעה',
  TERMINATED: 'סיים העסקה',
};

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  FULL_TIME: 'משרה מלאה',
  PART_TIME: 'משרה חלקית',
  HOURLY: 'שעתי',
  CONTRACTOR: 'קבלן',
};

export const SYSTEM_LINK_STATUS_LABELS: Record<SystemLinkStatus, string> = {
  NOT_STARTED: 'טרם החל',
  PENDING: 'ממתין',
  ACTIVE: 'פעיל',
  ERROR: 'נדרש טיפול',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  OK: 'תקין',
  MISSING_IN: 'חסרה כניסה',
  MISSING_OUT: 'חסרה יציאה',
  PENDING_APPROVAL: 'ממתין לאישור',
  APPROVED: 'אושר',
  REJECTED: 'נדחה',
};

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  MISSING_IN: 'חסרה כניסה',
  MISSING_OUT: 'חסרה יציאה',
  MANUAL_CORRECTION: 'בקשת תיקון ידני',
  LATE_ENTRY: 'איחור בכניסה',
  OVERLAPPING: 'חפיפת דיווחים',
  MANAGER_APPROVAL_REQUIRED: 'נדרש אישור מנהל',
};

export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  OPEN: 'פתוח',
  PENDING_APPROVAL: 'ממתין לאישור',
  APPROVED: 'אושר',
  REJECTED: 'נדחה',
};

export const ONBOARDING_STEP_LABELS: Record<OnboardingStepStatus, string> = {
  REQUESTED: 'בקשה נפתחה',
  HR_REVIEW: 'בבדיקת HR',
  MISSING_DOCUMENTS: 'חסרים מסמכים',
  DOCUMENTS_COMPLETE: 'מסמכים הושלמו',
  PAYROLL_SETUP: 'קליטה לשכר',
  ATTENDANCE_ACTIVATED: 'נוכחות הופעלה',
  ACTIVE: 'קליטה הושלמה',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  EMPLOYEE: 'עובד/ת',
  MANAGER: 'מנהל/ת',
  HR_REFERENT: 'רכז/ת משאבי אנוש',
  PAYROLL: 'שכר',
  HR_MANAGER: 'מנהל/ת משאבי אנוש',
  SYSTEM_ADMIN: 'מנהל/ת מערכת',
};

export const ATTENDANCE_METHOD_LABELS: Record<string, string> = {
  APP: 'אפליקציה',
  PHONE: 'טלפון',
  CLOCK: 'שעון נוכחות',
  MANUAL: 'ידני',
  NONE: 'לא הוגדר',
};
