import { useCallback, useEffect, useState } from 'react';
import type { AttendanceException, AttendanceRecord } from '../types/entities';
import {
  getAllExceptions,
  getAttendanceForEmployee,
  getTodayRecord,
} from '../services/attendanceService';

export function useEmployeeAttendance(employeeId: string | null) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!employeeId) {
      setRecords([]);
      setToday(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const [all, todayRecord] = await Promise.all([
      getAttendanceForEmployee(employeeId),
      getTodayRecord(employeeId),
    ]);
    setRecords(all);
    setToday(todayRecord);
    setIsLoading(false);
  }, [employeeId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { records, today, isLoading, refetch };
}

export function useAllExceptions() {
  const [exceptions, setExceptions] = useState<AttendanceException[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setExceptions(await getAllExceptions());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { exceptions, isLoading, refetch };
}
