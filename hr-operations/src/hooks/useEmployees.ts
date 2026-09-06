import { useCallback, useEffect, useState } from 'react';
import type { Employee, EmployeeAssignment } from '../types/entities';
import { getAllEmployees, getAssignmentsForEmployee } from '../services/employeeService';

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      setError(null);
    } catch {
      setError('טעינת רשימת העובדים נכשלה');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { employees, isLoading, error, refetch };
}

export function useEmployeeAssignments(employeeId: string | null) {
  const [assignments, setAssignments] = useState<EmployeeAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!employeeId) {
      setAssignments([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const data = await getAssignmentsForEmployee(employeeId);
    setAssignments(data);
    setIsLoading(false);
  }, [employeeId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { assignments, isLoading, refetch };
}
