import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useEmployees } from '../hooks/useEmployees';
import { useAllAssignments } from '../hooks/useAllAssignments';
import { useDepartmentsAndUnits } from '../hooks/useDepartments';
import { useAuthStore } from '../stores/authStore';
import { canViewEmployee } from '../permissions/policies';
import type { Employee } from '../types/entities';
import { EmployeeStatus } from '../types/enums';
import { SYSTEM_LINK_STATUS_LABELS } from '../config/labels';
import { SYSTEM_LINK_STATUS_TONE } from '../config/badgeColors';
import { formatDateIL } from '../utils/dateFormat';

export function PendingEmployeesPage() {
  const { employees, isLoading } = useEmployees();
  const { assignments } = useAllAssignments();
  const { departments, units } = useDepartmentsAndUnits();
  const currentUser = useAuthStore((s) => s.currentUser);
  const navigate = useNavigate();

  const departmentById = useMemo(() => new Map(departments.map((d) => [d.id, d])), [departments]);
  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);

  const pendingEmployees = useMemo(() => {
    if (!currentUser) return [];
    return employees.filter((employee) => {
      if (employee.status !== EmployeeStatus.PENDING) return false;
      const employeeAssignments = assignments.filter((a) => a.employeeId === employee.id);
      return canViewEmployee(currentUser, employee, employeeAssignments);
    });
  }, [employees, assignments, currentUser]);

  const columns: DataTableColumn<Employee>[] = [
    {
      key: 'name',
      header: 'עובד/ת',
      render: (e) => (
        <span className="font-medium text-gray-900">
          {e.firstName} {e.lastName}
        </span>
      ),
      sortValue: (e) => `${e.firstName} ${e.lastName}`,
    },
    {
      key: 'unit',
      header: 'יחידה',
      render: (e) => unitById.get(e.primaryUnitId)?.name ?? '—',
    },
    {
      key: 'department',
      header: 'מחלקה',
      render: (e) => departmentById.get(e.primaryDepartmentId)?.name ?? '—',
    },
    {
      key: 'startDate',
      header: 'תאריך התחלה',
      render: (e) => formatDateIL(e.startDate),
      sortValue: (e) => e.startDate,
    },
    {
      key: 'attendance',
      header: 'נוכחות',
      render: (e) => (
        <StatusBadge
          label={SYSTEM_LINK_STATUS_LABELS[e.attendanceSystemStatus]}
          tone={SYSTEM_LINK_STATUS_TONE[e.attendanceSystemStatus]}
        />
      ),
    },
    {
      key: 'hr',
      header: 'HR',
      render: (e) => (
        <StatusBadge label={SYSTEM_LINK_STATUS_LABELS[e.hrSystemStatus]} tone={SYSTEM_LINK_STATUS_TONE[e.hrSystemStatus]} />
      ),
    },
    {
      key: 'payroll',
      header: 'שכר',
      render: (e) => (
        <StatusBadge
          label={SYSTEM_LINK_STATUS_LABELS[e.payrollSystemStatus]}
          tone={SYSTEM_LINK_STATUS_TONE[e.payrollSystemStatus]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'דשבורד', to: '/dashboard' }, { label: 'קליטת עובדים' }]} />
      <div>
        <h1 className="text-xl font-bold text-gray-900">תור עובדים ממתינים לקליטה ({pendingEmployees.length})</h1>
        <p className="mt-1 text-sm text-gray-500">
          עובדים שכבר החלו לעבוד אך תהליך הקליטה שלהם ב-HR ו/או בשכר טרם הושלם.
        </p>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : pendingEmployees.length === 0 ? (
        <EmptyState message="אין כרגע עובדים הממתינים לקליטה" />
      ) : (
        <DataTable
          columns={columns}
          rows={pendingEmployees}
          rowKey={(e) => e.id}
          onRowClick={(e) => navigate(`/employees/${e.id}`)}
        />
      )}
    </div>
  );
}
