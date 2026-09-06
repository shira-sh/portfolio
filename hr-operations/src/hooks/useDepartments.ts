import { useEffect, useState } from 'react';
import type { Department, Unit } from '../types/entities';
import { getAllDepartments, getAllUnits } from '../services/departmentService';

export function useDepartmentsAndUnits() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [d, u] = await Promise.all([getAllDepartments(), getAllUnits()]);
      setDepartments(d);
      setUnits(u);
      setIsLoading(false);
    })();
  }, []);

  return { departments, units, isLoading };
}
