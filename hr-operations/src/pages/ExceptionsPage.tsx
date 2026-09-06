import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useAuthStore } from '../stores/authStore';
import { useAllExceptions } from '../hooks/useAttendance';
import { useEmployees } from '../hooks/useEmployees';
import { useAllAssignments } from '../hooks/useAllAssignments';
import { approveException, rejectException } from '../services/attendanceService';
import { canApproveAttendanceExceptions } from '../permissions/policies';
import type { AttendanceException } from '../types/entities';
import { ExceptionStatus } from '../types/enums';
import { EXCEPTION_STATUS_LABELS, EXCEPTION_TYPE_LABELS } from '../config/labels';
import { EXCEPTION_STATUS_TONE } from '../config/badgeColors';
import { formatDateTimeIL } from '../utils/dateFormat';

export function ExceptionsPage() {
  const { exceptions, isLoading, refetch } = useAllExceptions();
  const { employees } = useEmployees();
  const { assignments } = useAllAssignments();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);

  const visibleExceptions = useMemo(() => {
    if (!currentUser) return [];
    return exceptions.filter((exception) => {
      if (statusFilter && exception.status !== statusFilter) return false;
      const employee = employeeById.get(exception.employeeId);
      if (!employee) return false;
      const employeeAssignments = assignments.filter((a) => a.employeeId === employee.id);
      return canApproveAttendanceExceptions(currentUser, employee, employeeAssignments) || currentUser.role === 'HR_MANAGER';
    });
  }, [exceptions, statusFilter, employeeById, assignments, currentUser]);

  async function handleApprove(id: string) {
    if (!currentUser) return;
    await approveException(id, currentUser);
    refetch();
  }

  async function handleReject(id: string) {
    if (!currentUser) return;
    await rejectException(id, currentUser);
    refetch();
  }

  const columns: DataTableColumn<AttendanceException>[] = [
    {
      key: 'employee',
      header: 'עובד/ת',
      render: (e) => {
        const emp = employeeById.get(e.employeeId);
        return emp ? `${emp.firstName} ${emp.lastName}` : '—';
      },
    },
    { key: 'type', header: 'סוג חריג', render: (e) => EXCEPTION_TYPE_LABELS[e.type] },
    {
      key: 'status',
      header: 'סטטוס',
      render: (e) => <StatusBadge label={EXCEPTION_STATUS_LABELS[e.status]} tone={EXCEPTION_STATUS_TONE[e.status]} />,
    },
    { key: 'createdAt', header: 'נוצר בתאריך', render: (e) => formatDateTimeIL(e.createdAt), sortValue: (e) => e.createdAt },
    { key: 'details', header: 'פרטים', render: (e) => e.requestedChange ?? '—' },
    {
      key: 'actions',
      header: 'פעולות',
      render: (e) =>
        e.status === ExceptionStatus.OPEN || e.status === ExceptionStatus.PENDING_APPROVAL ? (
          <div className="flex gap-2">
            <button onClick={() => handleApprove(e.id)} className="text-xs font-medium text-emerald-600 hover:underline">
              אשר
            </button>
            <button onClick={() => handleReject(e.id)} className="text-xs font-medium text-red-600 hover:underline">
              דחה
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">טופל</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'דשבורד', to: '/dashboard' }, { label: 'חריגי נוכחות' }]} />
      <h1 className="text-xl font-bold text-gray-900">חריגי נוכחות ({visibleExceptions.length})</h1>

      {isLoading ? (
        <LoadingState />
      ) : visibleExceptions.length === 0 ? (
        <EmptyState message="לא נמצאו חריגי נוכחות" />
      ) : (
        <DataTable columns={columns} rows={visibleExceptions} rowKey={(e) => e.id} />
      )}
    </div>
  );
}
