import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Hourglass, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { StatusBadge } from '../components/StatusBadge';
import { useAuthStore } from '../stores/authStore';
import { useEmployees } from '../hooks/useEmployees';
import { useAllAssignments } from '../hooks/useAllAssignments';
import { useAllExceptions } from '../hooks/useAttendance';
import { EmployeeStatus, ExceptionStatus } from '../types/enums';
import { EMPLOYEE_STATUS_LABELS } from '../config/labels';
import { EMPLOYEE_STATUS_TONE } from '../config/badgeColors';

export function ManagerDashboardPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { assignments, isLoading: assignmentsLoading } = useAllAssignments();
  const { exceptions, isLoading: exceptionsLoading } = useAllExceptions();
  const navigate = useNavigate();

  const myEmployees = useMemo(() => {
    if (!currentUser?.employeeId) return [];
    return employees.filter((e) => {
      if (e.primaryManagerId === currentUser.employeeId) return true;
      return assignments.some((a) => a.employeeId === e.id && a.managerId === currentUser.employeeId);
    });
  }, [employees, assignments, currentUser]);

  const myEmployeeIds = useMemo(() => new Set(myEmployees.map((e) => e.id)), [myEmployees]);

  const pendingEmployees = myEmployees.filter((e) => e.status === EmployeeStatus.PENDING);
  const myExceptions = exceptions.filter((e) => myEmployeeIds.has(e.employeeId));
  const pendingApprovals = myExceptions.filter((e) => e.status === ExceptionStatus.PENDING_APPROVAL);
  const openExceptions = myExceptions.filter(
    (e) => e.status === ExceptionStatus.OPEN || e.status === ExceptionStatus.PENDING_APPROVAL,
  );

  const isLoading = employeesLoading || assignmentsLoading || exceptionsLoading;
  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">דשבורד ניהולי</h1>
        <p className="mt-1 text-sm text-gray-500">תמונת מצב עבור העובדים שבאחריותך</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="העובדים שלי" value={myEmployees.length} icon={Users} tone="default" />
        <KpiCard label="עובדים ממתינים לקליטה" value={pendingEmployees.length} icon={Hourglass} tone="warning" />
        <KpiCard label="חריגי נוכחות פתוחים" value={openExceptions.length} icon={AlertTriangle} tone="danger" to="/exceptions" />
        <KpiCard label="ממתין לאישורי" value={pendingApprovals.length} icon={CheckCircle2} tone="warning" to="/exceptions?status=PENDING_APPROVAL" />
      </div>

      <Card title="העובדים שלי">
        {myEmployees.length === 0 ? (
          <EmptyState message="אין עדיין עובדים המשויכים אליך כמנהל/ת ישיר/ה" />
        ) : (
          <div className="divide-y divide-gray-100">
            {myEmployees.map((e) => (
              <button
                key={e.id}
                onClick={() => navigate(`/employees/${e.id}`)}
                className="flex w-full items-center justify-between py-2.5 text-right hover:bg-gray-50"
              >
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {e.firstName} {e.lastName}
                  </span>
                  <span className="mr-2 text-xs text-gray-400">{e.roleTitle}</span>
                </div>
                <StatusBadge label={EMPLOYEE_STATUS_LABELS[e.status]} tone={EMPLOYEE_STATUS_TONE[e.status]} />
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
