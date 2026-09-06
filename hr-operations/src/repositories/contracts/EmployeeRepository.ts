import type { Employee } from '../../types/entities';

export interface EmployeeRepository {
  getAll(): Promise<Employee[]>;
  getById(id: string): Promise<Employee | null>;
  findByNationalId(nationalId: string): Promise<Employee | null>;
  create(employee: Employee): Promise<Employee>;
  update(id: string, patch: Partial<Employee>): Promise<Employee>;
}
