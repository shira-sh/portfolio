import type { AttendanceException, AttendanceRecord } from '../../types/entities';
import type { AttendanceSource, AttendanceStatus, ExceptionStatus, ExceptionType } from '../../types/enums';
import { numOrNull, str, strOrNull } from '../mapperUtils';

export function rowToAttendanceRecord(row: Record<string, unknown>): AttendanceRecord {
  return {
    id: str(row.id),
    employeeId: str(row.employeeId),
    date: str(row.date),
    clockIn: strOrNull(row.clockIn),
    clockOut: strOrNull(row.clockOut),
    workedMinutes: numOrNull(row.workedMinutes),
    status: str(row.status) as AttendanceStatus,
    source: str(row.source) as AttendanceSource,
    unitId: str(row.unitId),
    createdAt: str(row.createdAt),
    updatedAt: str(row.updatedAt),
  };
}

export function attendanceRecordToRow(record: AttendanceRecord): Record<string, unknown> {
  return {
    ...record,
    clockIn: record.clockIn ?? '',
    clockOut: record.clockOut ?? '',
    workedMinutes: record.workedMinutes ?? '',
  };
}

export function rowToAttendanceException(row: Record<string, unknown>): AttendanceException {
  return {
    id: str(row.id),
    employeeId: str(row.employeeId),
    attendanceRecordId: strOrNull(row.attendanceRecordId),
    type: str(row.type) as ExceptionType,
    status: str(row.status) as ExceptionStatus,
    requestedChange: strOrNull(row.requestedChange),
    createdAt: str(row.createdAt),
    resolvedAt: strOrNull(row.resolvedAt),
    resolvedBy: strOrNull(row.resolvedBy),
  };
}

export function attendanceExceptionToRow(exception: AttendanceException): Record<string, unknown> {
  return {
    ...exception,
    attendanceRecordId: exception.attendanceRecordId ?? '',
    requestedChange: exception.requestedChange ?? '',
    resolvedAt: exception.resolvedAt ?? '',
    resolvedBy: exception.resolvedBy ?? '',
  };
}
