import type { EmployeeRepository } from '../contracts/EmployeeRepository';
import type { Employee } from '../../types/entities';
import { getDatabase, touch } from '../../excel/dbState';

export class ExcelEmployeeRepository implements EmployeeRepository {
  async getAll(): Promise<Employee[]> {
    return [...getDatabase().employees];
  }

  async getById(id: string): Promise<Employee | null> {
    return getDatabase().employees.find((e) => e.id === id) ?? null;
  }

  async findByNationalId(nationalId: string): Promise<Employee | null> {
    return getDatabase().employees.find((e) => e.nationalId === nationalId) ?? null;
  }

  async create(employee: Employee): Promise<Employee> {
    getDatabase().employees.push(employee);
    await touch();
    return employee;
  }

  async update(id: string, patch: Partial<Employee>): Promise<Employee> {
    const db = getDatabase();
    const index = db.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error(`Employee not found: ${id}`);
    const updated = { ...db.employees[index], ...patch };
    db.employees[index] = updated;
    await touch();
    return updated;
  }
}
