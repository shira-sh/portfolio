import {
  attendanceExceptionRepository,
  attendanceRepository,
  employeeRepository,
} from '../repositories';
import type { AttendanceException, AttendanceRecord, Employee, User } from '../types/entities';
import { AttendanceStatus, ExceptionStatus, ExceptionType, SystemLinkStatus } from '../types/enums';
import { newId } from '../utils/id';
import { currentTimeHM, isoDateToday, minutesBetween, nowIso } from '../utils/dateFormat';
import { logEvent } from './auditService';

function methodToSource(employee: Employee): AttendanceRecord['source'] {
  switch (employee.attendanceMethod) {
    case 'APP':
      return 'APP';
    case 'PHONE':
      return 'PHONE';
    case 'CLOCK':
      return 'CLOCK';
    default:
      return employee.status === 'PENDING' ? 'TEMP_EMPLOYEE' : 'MANUAL';
  }
}

export async function getAttendanceForEmployee(employeeId: string): Promise<AttendanceRecord[]> {
  const records = await attendanceRepository.getByEmployeeId(employeeId);
  return [...records].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getMonthlyAttendance(
  employeeId: string,
  yearMonth: string,
): Promise<AttendanceRecord[]> {
  const records = await getAttendanceForEmployee(employeeId);
  return records.filter((r) => r.date.startsWith(yearMonth));
}

export async function getTodayRecord(employeeId: string): Promise<AttendanceRecord | null> {
  return attendanceRepository.getByEmployeeAndDate(employeeId, isoDateToday());
}

export async function clockIn(employeeId: string, actingUser: User): Promise<AttendanceRecord> {
  const employee = await employeeRepository.getById(employeeId);
  if (!employee) throw new Error('עובד לא נמצא');
  if (employee.attendanceSystemStatus !== SystemLinkStatus.ACTIVE) {
    throw new Error('דיווח נוכחות אינו פעיל עבור עובד זה - יש לקבל אישור מנהל');
  }

  const existing = await getTodayRecord(employeeId);
  if (existing && existing.clockIn) {
    throw new Error('כבר דווחה כניסה היום');
  }

  const timestamp = nowIso();
  const clockIn = currentTimeHM();

  if (existing) {
    const updated = await attendanceRepository.update(existing.id, {
      clockIn,
      status: AttendanceStatus.MISSING_OUT,
      updatedAt: timestamp,
    });
    await logEvent(actingUser, 'ATTENDANCE_CLOCK_IN', 'AttendanceRecord', updated.id, `כניסה בשעה ${clockIn}`);
    return updated;
  }

  const record: AttendanceRecord = {
    id: newId(),
    employeeId,
    date: isoDateToday(),
    clockIn,
    clockOut: null,
    workedMinutes: null,
    status: AttendanceStatus.MISSING_OUT,
    source: methodToSource(employee),
    unitId: employee.primaryUnitId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  await attendanceRepository.create(record);
  await logEvent(actingUser, 'ATTENDANCE_CLOCK_IN', 'AttendanceRecord', record.id, `כניסה בשעה ${clockIn}`);
  return record;
}

export async function clockOut(employeeId: string, actingUser: User): Promise<AttendanceRecord> {
  const existing = await getTodayRecord(employeeId);
  if (!existing || !existing.clockIn) {
    throw new Error('לא נמצא דיווח כניסה עבור היום');
  }
  if (existing.clockOut) {
    throw new Error('כבר דווחה יציאה היום');
  }

  const clockOutTime = currentTimeHM();
  const workedMinutes = Math.max(0, minutesBetween(existing.clockIn, clockOutTime));

  const updated = await attendanceRepository.update(existing.id, {
    clockOut: clockOutTime,
    workedMinutes,
    status: AttendanceStatus.OK,
    updatedAt: nowIso(),
  });

  await logEvent(actingUser, 'ATTENDANCE_CLOCK_OUT', 'AttendanceRecord', updated.id, `יציאה בשעה ${clockOutTime}`);
  return updated;
}

export async function getAllExceptions(): Promise<AttendanceException[]> {
  return attendanceExceptionRepository.getAll();
}

export async function getExceptionsForEmployee(employeeId: string): Promise<AttendanceException[]> {
  return attendanceExceptionRepository.getByEmployeeId(employeeId);
}

export async function createManualCorrectionRequest(
  employeeId: string,
  attendanceRecordId: string | null,
  requestedChange: string,
  actingUser: User,
): Promise<AttendanceException> {
  const exception: AttendanceException = {
    id: newId(),
    employeeId,
    attendanceRecordId,
    type: ExceptionType.MANUAL_CORRECTION,
    status: ExceptionStatus.PENDING_APPROVAL,
    requestedChange,
    createdAt: nowIso(),
    resolvedAt: null,
    resolvedBy: null,
  };
  await attendanceExceptionRepository.create(exception);
  await logEvent(actingUser, 'EXCEPTION_CREATED', 'AttendanceException', exception.id, requestedChange);
  return exception;
}

export async function approveException(
  exceptionId: string,
  actingUser: User,
): Promise<AttendanceException> {
  const updated = await attendanceExceptionRepository.update(exceptionId, {
    status: ExceptionStatus.APPROVED,
    resolvedAt: nowIso(),
    resolvedBy: actingUser.id,
  });
  await logEvent(actingUser, 'EXCEPTION_APPROVED', 'AttendanceException', exceptionId, 'חריג אושר');
  return updated;
}

export async function rejectException(
  exceptionId: string,
  actingUser: User,
): Promise<AttendanceException> {
  const updated = await attendanceExceptionRepository.update(exceptionId, {
    status: ExceptionStatus.REJECTED,
    resolvedAt: nowIso(),
    resolvedBy: actingUser.id,
  });
  await logEvent(actingUser, 'EXCEPTION_REJECTED', 'AttendanceException', exceptionId, 'חריג נדחה');
  return updated;
}
