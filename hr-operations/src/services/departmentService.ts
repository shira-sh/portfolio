import { departmentRepository, unitRepository } from '../repositories';
import type { Department, Unit } from '../types/entities';

export async function getAllDepartments(): Promise<Department[]> {
  return departmentRepository.getAll();
}

export async function getDepartmentById(id: string): Promise<Department | null> {
  return departmentRepository.getById(id);
}

export async function getAllUnits(): Promise<Unit[]> {
  return unitRepository.getAll();
}

export async function getUnitsByDepartment(departmentId: string): Promise<Unit[]> {
  return unitRepository.getByDepartmentId(departmentId);
}

export async function getUnitById(id: string): Promise<Unit | null> {
  return unitRepository.getById(id);
}
