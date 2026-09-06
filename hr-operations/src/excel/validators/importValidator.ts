import type { Database } from '../../types/database';
import { EmployeeStatus } from '../../types/enums';

export interface ImportValidationResult {
  totalEmployees: number;
  validEmployees: number;
  missingManager: number;
  missingDepartment: number;
  missingUnit: number;
  duplicateNationalIds: number;
  missingRequiredFields: number;
  invalidStatus: number;
  invalidDates: number;
}

const VALID_STATUSES = new Set(Object.values(EmployeeStatus));
const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;

/** Validates an imported workbook's Employees sheet against its own Departments/Units/
 * Employees, per spec section 38. Never mutates or silently fixes data - only reports. */
export function validateImport(db: Database): ImportValidationResult {
  const departmentIds = new Set(db.departments.map((d) => d.id));
  const unitIds = new Set(db.units.map((u) => u.id));
  const employeeIds = new Set(db.employees.map((e) => e.id));
  const nationalIdCounts = new Map<string, number>();

  for (const employee of db.employees) {
    nationalIdCounts.set(employee.nationalId, (nationalIdCounts.get(employee.nationalId) ?? 0) + 1);
  }

  let missingManager = 0;
  let missingDepartment = 0;
  let missingUnit = 0;
  let missingRequiredFields = 0;
  let invalidStatus = 0;
  let invalidDates = 0;
  let invalidCount = 0;

  for (const employee of db.employees) {
    let hasIssue = false;

    if (!employee.firstName || !employee.lastName || !employee.nationalId) {
      missingRequiredFields += 1;
      hasIssue = true;
    }
    if (!departmentIds.has(employee.primaryDepartmentId)) {
      missingDepartment += 1;
      hasIssue = true;
    }
    if (!unitIds.has(employee.primaryUnitId)) {
      missingUnit += 1;
      hasIssue = true;
    }
    if (employee.primaryManagerId && !employeeIds.has(employee.primaryManagerId)) {
      missingManager += 1;
      hasIssue = true;
    }
    if (!VALID_STATUSES.has(employee.status)) {
      invalidStatus += 1;
      hasIssue = true;
    }
    if (!ISO_DATE_RE.test(employee.startDate)) {
      invalidDates += 1;
      hasIssue = true;
    }
    if ((nationalIdCounts.get(employee.nationalId) ?? 0) > 1) {
      hasIssue = true;
    }

    if (hasIssue) invalidCount += 1;
  }

  const duplicateNationalIds = [...nationalIdCounts.values()].filter((count) => count > 1).length;

  return {
    totalEmployees: db.employees.length,
    validEmployees: db.employees.length - invalidCount,
    missingManager,
    missingDepartment,
    missingUnit,
    duplicateNationalIds,
    missingRequiredFields,
    invalidStatus,
    invalidDates,
  };
}
