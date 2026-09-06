import * as XLSX from 'xlsx';
import { createEmptyDatabase, SHEET_NAMES, type Database } from '../types/database';
import { rowToEmployee, employeeToRow } from './mappers/employeeExcelMapper';
import {
  rowToEmployeeAssignment,
  employeeAssignmentToRow,
} from './mappers/employeeAssignmentExcelMapper';
import { rowToDepartment, departmentToRow, rowToUnit, unitToRow } from './mappers/departmentExcelMapper';
import {
  rowToAttendanceRecord,
  attendanceRecordToRow,
  rowToAttendanceException,
  attendanceExceptionToRow,
} from './mappers/attendanceExcelMapper';
import {
  rowToOnboardingRequest,
  onboardingRequestToRow,
  rowToOnboardingStep,
  onboardingStepToRow,
} from './mappers/onboardingExcelMapper';
import { rowToUser, userToRow } from './mappers/userExcelMapper';
import { rowToAuditEvent, auditEventToRow } from './mappers/auditExcelMapper';

/** Excel Adapter: the only module in the codebase that talks to SheetJS / the raw
 * xlsx binary format. Everything above this layer (repositories, services, UI) works
 * with the typed `Database` object only. */

function sheetToRows(workbook: XLSX.WorkBook, sheetName: string): Record<string, unknown>[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
}

export function parseWorkbook(buffer: ArrayBuffer): Database {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const db = createEmptyDatabase();

  db.employees = sheetToRows(workbook, SHEET_NAMES.Employees).map(rowToEmployee);
  db.employeeAssignments = sheetToRows(workbook, SHEET_NAMES.EmployeeAssignments).map(
    rowToEmployeeAssignment,
  );
  db.departments = sheetToRows(workbook, SHEET_NAMES.Departments).map(rowToDepartment);
  db.units = sheetToRows(workbook, SHEET_NAMES.Units).map(rowToUnit);
  db.attendance = sheetToRows(workbook, SHEET_NAMES.Attendance).map(rowToAttendanceRecord);
  db.attendanceExceptions = sheetToRows(workbook, SHEET_NAMES.AttendanceExceptions).map(
    rowToAttendanceException,
  );
  db.onboardingRequests = sheetToRows(workbook, SHEET_NAMES.Onboarding).map(rowToOnboardingRequest);
  db.onboardingSteps = sheetToRows(workbook, SHEET_NAMES.OnboardingSteps).map(rowToOnboardingStep);
  db.users = sheetToRows(workbook, SHEET_NAMES.Users).map(rowToUser);
  db.auditLog = sheetToRows(workbook, SHEET_NAMES.AuditLog).map(rowToAuditEvent);

  return db;
}

export function requiredSheetsPresent(buffer: ArrayBuffer): { ok: boolean; missing: string[] } {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const missing = Object.values(SHEET_NAMES).filter((name) => !workbook.Sheets[name]);
  return { ok: missing.length === 0, missing };
}

export function buildWorkbook(db: Database): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  const addSheet = (name: string, rows: Record<string, unknown>[]) => {
    const sheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, sheet, name);
  };

  addSheet(SHEET_NAMES.Employees, db.employees.map(employeeToRow));
  addSheet(SHEET_NAMES.EmployeeAssignments, db.employeeAssignments.map(employeeAssignmentToRow));
  addSheet(SHEET_NAMES.Departments, db.departments.map(departmentToRow));
  addSheet(SHEET_NAMES.Units, db.units.map(unitToRow));
  addSheet(SHEET_NAMES.Attendance, db.attendance.map(attendanceRecordToRow));
  addSheet(SHEET_NAMES.AttendanceExceptions, db.attendanceExceptions.map(attendanceExceptionToRow));
  addSheet(SHEET_NAMES.Onboarding, db.onboardingRequests.map(onboardingRequestToRow));
  addSheet(SHEET_NAMES.OnboardingSteps, db.onboardingSteps.map(onboardingStepToRow));
  addSheet(SHEET_NAMES.Users, db.users.map(userToRow));
  addSheet(SHEET_NAMES.AuditLog, db.auditLog.map(auditEventToRow));

  return workbook;
}

export function workbookToArrayBuffer(db: Database): ArrayBuffer {
  const workbook = buildWorkbook(db);
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
}

export function rowCounts(db: Database): Record<string, number> {
  return {
    [SHEET_NAMES.Employees]: db.employees.length,
    [SHEET_NAMES.EmployeeAssignments]: db.employeeAssignments.length,
    [SHEET_NAMES.Departments]: db.departments.length,
    [SHEET_NAMES.Units]: db.units.length,
    [SHEET_NAMES.Attendance]: db.attendance.length,
    [SHEET_NAMES.AttendanceExceptions]: db.attendanceExceptions.length,
    [SHEET_NAMES.Onboarding]: db.onboardingRequests.length,
    [SHEET_NAMES.OnboardingSteps]: db.onboardingSteps.length,
    [SHEET_NAMES.Users]: db.users.length,
    [SHEET_NAMES.AuditLog]: db.auditLog.length,
  };
}
