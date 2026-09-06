import type { Department, Unit } from '../../types/entities';

export interface DepartmentRepository {
  getAll(): Promise<Department[]>;
  getById(id: string): Promise<Department | null>;
}

export interface UnitRepository {
  getAll(): Promise<Unit[]>;
  getById(id: string): Promise<Unit | null>;
  getByDepartmentId(departmentId: string): Promise<Unit[]>;
}
