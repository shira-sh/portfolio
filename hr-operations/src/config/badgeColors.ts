/** Tailwind class sets for status badges, kept in one place so every screen renders
 * the same status with the same color (spec section 46 - visual consistency). */

export type BadgeTone = 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'purple';

export const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  gray: 'bg-gray-100 text-gray-700 ring-gray-300',
  blue: 'bg-blue-50 text-blue-700 ring-blue-300',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-300',
  amber: 'bg-amber-50 text-amber-700 ring-amber-300',
  red: 'bg-red-50 text-red-700 ring-red-300',
  purple: 'bg-violet-50 text-violet-700 ring-violet-300',
};

export const EMPLOYEE_STATUS_TONE: Record<string, BadgeTone> = {
  PENDING: 'amber',
  ACTIVE: 'green',
  INACTIVE: 'gray',
  SUSPENDED: 'red',
  TERMINATED: 'gray',
};

export const SYSTEM_LINK_STATUS_TONE: Record<string, BadgeTone> = {
  NOT_STARTED: 'gray',
  PENDING: 'amber',
  ACTIVE: 'green',
  ERROR: 'red',
};

export const ATTENDANCE_STATUS_TONE: Record<string, BadgeTone> = {
  OK: 'green',
  MISSING_IN: 'red',
  MISSING_OUT: 'red',
  PENDING_APPROVAL: 'amber',
  APPROVED: 'green',
  REJECTED: 'gray',
};

export const EXCEPTION_STATUS_TONE: Record<string, BadgeTone> = {
  OPEN: 'red',
  PENDING_APPROVAL: 'amber',
  APPROVED: 'green',
  REJECTED: 'gray',
};
