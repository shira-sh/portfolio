import type {
  AttendanceExceptionRepository,
  AttendanceRepository,
} from '../contracts/AttendanceRepository';
import type { AttendanceException, AttendanceRecord } from '../../types/entities';
import { getDatabase, touch } from '../../excel/dbState';

export class ExcelAttendanceRepository implements AttendanceRepository {
  async getAll(): Promise<AttendanceRecord[]> {
    return [...getDatabase().attendance];
  }

  async getByEmployeeId(employeeId: string): Promise<AttendanceRecord[]> {
    return getDatabase().attendance.filter((a) => a.employeeId === employeeId);
  }

  async getByEmployeeAndDate(employeeId: string, date: string): Promise<AttendanceRecord | null> {
    return (
      getDatabase().attendance.find((a) => a.employeeId === employeeId && a.date === date) ?? null
    );
  }

  async create(record: AttendanceRecord): Promise<AttendanceRecord> {
    getDatabase().attendance.push(record);
    await touch();
    return record;
  }

  async update(id: string, patch: Partial<AttendanceRecord>): Promise<AttendanceRecord> {
    const db = getDatabase();
    const index = db.attendance.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`AttendanceRecord not found: ${id}`);
    const updated = { ...db.attendance[index], ...patch };
    db.attendance[index] = updated;
    await touch();
    return updated;
  }
}

export class ExcelAttendanceExceptionRepository implements AttendanceExceptionRepository {
  async getAll(): Promise<AttendanceException[]> {
    return [...getDatabase().attendanceExceptions];
  }

  async getByEmployeeId(employeeId: string): Promise<AttendanceException[]> {
    return getDatabase().attendanceExceptions.filter((e) => e.employeeId === employeeId);
  }

  async create(exception: AttendanceException): Promise<AttendanceException> {
    getDatabase().attendanceExceptions.push(exception);
    await touch();
    return exception;
  }

  async update(id: string, patch: Partial<AttendanceException>): Promise<AttendanceException> {
    const db = getDatabase();
    const index = db.attendanceExceptions.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`AttendanceException not found: ${id}`);
    const updated = { ...db.attendanceExceptions[index], ...patch };
    db.attendanceExceptions[index] = updated;
    await touch();
    return updated;
  }
}
