import { useEffect, useState } from 'react';
import type { EmployeeAssignment } from '../types/entities';
import { employeeAssignmentRepository } from '../repositories';

export function useAllAssignments() {
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    employeeAssignmentRepository.getAll().then((data) => {
      setAssignments(data);
      setIsLoading(false);
    });
  }, []);

  return { assignments, isLoading };
}

export function assignmentsForEmployee(
  all: EmployeeAssignment[],
  employeeId: string,
): EmployeeAssignment[] {
  return all.filter((a) => a.employeeId === employeeId);
}
