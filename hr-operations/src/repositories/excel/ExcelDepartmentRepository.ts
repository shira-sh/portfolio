import type { DepartmentRepository, UnitRepository } from '../contracts/DepartmentRepository';
import type { Department, Unit } from '../../types/entities';
import { getDatabase } from '../../excel/dbState';

export class ExcelDepartmentRepository implements DepartmentRepository {
  async getAll(): Promise<Department[]> {
    return [...getDatabase().departments];
  }

  async getById(id: string): Promise<Department | null> {
    return getDatabase().departments.find((d) => d.id === id) ?? null;
  }
}

export class ExcelUnitRepository implements UnitRepository {
  async getAll(): Promise<Unit[]> {
    return [...getDatabase().units];
  }

  async getById(id: string): Promise<Unit | null> {
    return getDatabase().units.find((u) => u.id === id) ?? null;
  }

  async getByDepartmentId(departmentId: string): Promise<Unit[]> {
    return getDatabase().units.filter((u) => u.departmentId === departmentId);
  }
}
