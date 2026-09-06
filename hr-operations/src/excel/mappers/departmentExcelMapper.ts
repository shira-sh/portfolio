import type { Department, Unit } from '../../types/entities';
import { bool, str, strOrNull } from '../mapperUtils';

export function rowToDepartment(row: Record<string, unknown>): Department {
  return {
    id: str(row.id),
    name: str(row.name),
    code: str(row.code),
    parentDepartmentId: strOrNull(row.parentDepartmentId),
    isActive: bool(row.isActive),
  };
}

export function departmentToRow(department: Department): Record<string, unknown> {
  return { ...department, parentDepartmentId: department.parentDepartmentId ?? '' };
}

export function rowToUnit(row: Record<string, unknown>): Unit {
  return {
    id: str(row.id),
    departmentId: str(row.departmentId),
    name: str(row.name),
    code: str(row.code),
    address: strOrNull(row.address),
    isActive: bool(row.isActive),
  };
}

export function unitToRow(unit: Unit): Record<string, unknown> {
  return { ...unit, address: unit.address ?? '' };
}
