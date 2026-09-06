import type { EmployeeAssignment } from '../../types/entities';

export interface EmployeeAssignmentRepository {
  getAll(): Promise<EmployeeAssignment[]>;
  getByEmployeeId(employeeId: string): Promise<EmployeeAssignment[]>;
  create(assignment: EmployeeAssignment): Promise<EmployeeAssignment>;
  update(id: string, patch: Partial<EmployeeAssignment>): Promise<EmployeeAssignment>;
}
