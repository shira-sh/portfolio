import type { EmployeeAssignmentRepository } from '../contracts/EmployeeAssignmentRepository';
import type { EmployeeAssignment } from '../../types/entities';
import { getDatabase, touch } from '../../excel/dbState';

export class ExcelEmployeeAssignmentRepository implements EmployeeAssignmentRepository {
  async getAll(): Promise<EmployeeAssignment[]> {
    return [...getDatabase().employeeAssignments];
  }

  async getByEmployeeId(employeeId: string): Promise<EmployeeAssignment[]> {
    return getDatabase().employeeAssignments.filter((a) => a.employeeId === employeeId);
  }

  async create(assignment: EmployeeAssignment): Promise<EmployeeAssignment> {
    getDatabase().employeeAssignments.push(assignment);
    await touch();
    return assignment;
  }

  async update(id: string, patch: Partial<EmployeeAssignment>): Promise<EmployeeAssignment> {
    const db = getDatabase();
    const index = db.employeeAssignments.findIndex((a) => a.id === id);
    if (index === -1) throw new Error(`EmployeeAssignment not found: ${id}`);
    const updated = { ...db.employeeAssignments[index], ...patch };
    db.employeeAssignments[index] = updated;
    await touch();
    return updated;
  }
}
