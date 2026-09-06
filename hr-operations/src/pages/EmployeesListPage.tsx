import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useEmployees } from '../hooks/useEmployees';
import { useAllAssignments } from '../hooks/useAllAssignments';
import { useDepartmentsAndUnits } from '../hooks/useDepartments';
import { useAuthStore } from '../stores/authStore';
import { canCreateEmployee, canViewEmployee } from '../permissions/policies';
import type { Employee } from '../types/entities';
import {
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  SYSTEM_LINK_STATUS_LABELS,
} from '../config/labels';
import { EMPLOYEE_STATUS_TONE, SYSTEM_LINK_STATUS_TONE } from '../config/badgeColors';
import { formatDateIL } from '../utils/dateFormat';

export function EmployeesListPage() {
  const { employees, isLoading } = useEmployees();
  const { assignments } = useAllAssignments();
  const { departments, units } = useDepartmentsAndUnits();
  const currentUser = useAuthStore((s) => s.currentUser);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const employeeById = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);
  const departmentById = useMemo(() => new Map(departments.map((d) => [d.id, d])), [departments]);
  const unitById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);

  const statusFilter = searchParams.get('status');
  const hrStatusFilter = searchParams.get('hrStatus');
  const payrollStatusFilter = searchParams.get('payrollStatus');
  const attendanceStatusFilter = searchParams.get('attendanceStatus');
  const attendanceMethodFilter = searchParams.get('attendanceMethod');

  const visibleEmployees = useMemo(() => {
    if (!currentUser) return [];
    return employees.filter((employee) => {
      const employeeAssignments = assignments.filter((a) => a.employeeId === employee.id);
      if (!canViewEmployee(currentUser, employee, employeeAssignments)) return false;
      if (statusFilter && employee.status !== statusFilter) return false;
      if (hrStatusFilter && employee.hrSystemStatus !== hrStatusFilter) return false;
      if (payrollStatusFilter && employee.payrollSystemStatus !== payrollStatusFilter) return false;
      if (attendanceStatusFilter && employee.attendanceSystemStatus !== attendanceStatusFilter) return false;
      if (attendanceMethodFilter && employee.attendanceMethod !== attendanceMethodFilter) return false;
      if (search) {
        const q = search.trim().toLowerCase();
        const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
        const dept = departmentById.get(employee.primaryDepartmentId)?.name.toLowerCase() ?? '';
        const unit = unitById.get(employee.primaryUnitId)?.name.toLowerCase() ?? '';
        const manager = employee.primaryManagerId
          ? `${employeeById.get(employee.primaryManagerId)?.firstName ?? ''} ${
              employeeById.get(employee.primaryManagerId)?.lastName ?? ''
            }`.toLowerCase()
          : '';
        const haystack = `${fullName} ${employee.nationalId} ${employee.phone} ${dept} ${unit} ${manager}`;
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [
    employees,
    assignments,
    currentUser,
    statusFilter,
    hrStatusFilter,
    payrollStatusFilter,
    attendanceStatusFilter,
    attendanceMethodFilter,
    search,
    departmentById,
    unitById,
    employeeById,
  ]);

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
    { key: 'nationalId', header: 'ת.ז.', render: (e) => e.nationalId },
    {
      key: 'department',
      header: 'מחלקה',
      render: (e) => departmentById.get(e.primaryDepartmentId)?.name ?? '—',
    },
    { key: 'unit', header: 'יחידה', render: (e) => unitById.get(e.primaryUnitId)?.name ?? '—' },
    {
      key: 'manager',
      header: 'מנהל/ת',
      render: (e) => {
        const manager = e.primaryManagerId ? employeeById.get(e.primaryManagerId) : null;
        return manager ? `${manager.firstName} ${manager.lastName}` : '—';
      },
    },
    {
      key: 'employmentType',
      header: 'סוג העסקה',
      render: (e) => EMPLOYMENT_TYPE_LABELS[e.employmentType],
      hiddenByDefault: true,
    },
    {
      key: 'status',
      header: 'סטטוס עובד',
      render: (e) => <StatusBadge label={EMPLOYEE_STATUS_LABELS[e.status]} tone={EMPLOYEE_STATUS_TONE[e.status]} />,
    },
    {
      key: 'attendanceStatus',
      header: 'סטטוס נוכחות',
      render: (e) => (
        <StatusBadge
          label={SYSTEM_LINK_STATUS_LABELS[e.attendanceSystemStatus]}
          tone={SYSTEM_LINK_STATUS_TONE[e.attendanceSystemStatus]}
        />
      ),
    },
    {
      key: 'hrStatus',
      header: 'סטטוס HR',
      render: (e) => (
        <StatusBadge label={SYSTEM_LINK_STATUS_LABELS[e.hrSystemStatus]} tone={SYSTEM_LINK_STATUS_TONE[e.hrSystemStatus]} />
      ),
    },
    {
      key: 'payrollStatus',
      header: 'סטטוס שכר',
      render: (e) => (
        <StatusBadge
          label={SYSTEM_LINK_STATUS_LABELS[e.payrollSystemStatus]}
          tone={SYSTEM_LINK_STATUS_TONE[e.payrollSystemStatus]}
        />
      ),
    },
    {
      key: 'startDate',
      header: 'תאריך התחלה',
      render: (e) => formatDateIL(e.startDate),
      sortValue: (e) => e.startDate,
      hiddenByDefault: true,
    },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'דשבורד', to: '/dashboard' }, { label: 'עובדים' }]} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">עובדים ({visibleEmployees.length})</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם, ת.ז, טלפון, מחלקה..."
              className="w-72 rounded-lg border border-gray-200 py-2 pl-3 pr-9 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          {currentUser && canCreateEmployee(currentUser) && (
            <button
              type="button"
              onClick={() => navigate('/employees/new')}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus size={16} />
              הוספת עובד
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : visibleEmployees.length === 0 ? (
        <EmptyState message="לא נמצאו עובדים התואמים את החיפוש" />
      ) : (
        <DataTable
          columns={columns}
          rows={visibleEmployees}
          rowKey={(e) => e.id}
          onRowClick={(e) => navigate(`/employees/${e.id}`)}
        />
      )}
    </div>
  );
}
