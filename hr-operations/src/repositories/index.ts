/** Composition root: binds each Repository interface to its current implementation.
 * Services import from here, never from a concrete `Excel*Repository` class directly.
 * Migrating to a real API means swapping the right-hand side of each line below for
 * an `Api*Repository` implementation - nothing else in the app changes. */

import { ExcelEmployeeRepository } from './excel/ExcelEmployeeRepository';
import { ExcelEmployeeAssignmentRepository } from './excel/ExcelEmployeeAssignmentRepository';
import { ExcelDepartmentRepository, ExcelUnitRepository } from './excel/ExcelDepartmentRepository';
import {
  ExcelAttendanceExceptionRepository,
  ExcelAttendanceRepository,
} from './excel/ExcelAttendanceRepository';
import { ExcelOnboardingRepository } from './excel/ExcelOnboardingRepository';
import { ExcelUserRepository } from './excel/ExcelUserRepository';
import { ExcelAuditRepository } from './excel/ExcelAuditRepository';

export const employeeRepository = new ExcelEmployeeRepository();
export const employeeAssignmentRepository = new ExcelEmployeeAssignmentRepository();
export const departmentRepository = new ExcelDepartmentRepository();
export const unitRepository = new ExcelUnitRepository();
export const attendanceRepository = new ExcelAttendanceRepository();
export const attendanceExceptionRepository = new ExcelAttendanceExceptionRepository();
export const onboardingRepository = new ExcelOnboardingRepository();
export const userRepository = new ExcelUserRepository();
export const auditRepository = new ExcelAuditRepository();
