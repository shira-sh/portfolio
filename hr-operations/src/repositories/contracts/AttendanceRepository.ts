import type { AttendanceException, AttendanceRecord } from '../../types/entities';

export interface AttendanceRepository {
  getAll(): Promise<AttendanceRecord[]>;
  getByEmployeeId(employeeId: string): Promise<AttendanceRecord[]>;
  getByEmployeeAndDate(employeeId: string, date: string): Promise<AttendanceRecord | null>;
  create(record: AttendanceRecord): Promise<AttendanceRecord>;
  update(id: string, patch: Partial<AttendanceRecord>): Promise<AttendanceRecord>;
}

export interface AttendanceExceptionRepository {
  getAll(): Promise<AttendanceException[]>;
  getByEmployeeId(employeeId: string): Promise<AttendanceException[]>;
  create(exception: AttendanceException): Promise<AttendanceException>;
  update(id: string, patch: Partial<AttendanceException>): Promise<AttendanceException>;
}
