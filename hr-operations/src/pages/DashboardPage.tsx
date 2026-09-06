import { useEffect, useMemo, useState } from 'react';
import { Users, Hourglass, AlertTriangle, CheckCircle2, Wallet, Clock3, UserX, Building2 } from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { useEmployees } from '../hooks/useEmployees';
import { useAllExceptions } from '../hooks/useAttendance';
import { useDepartmentsAndUnits } from '../hooks/useDepartments';
import { EmployeeStatus, ExceptionStatus, SystemLinkStatus } from '../types/enums';
import { isoDateToday } from '../utils/dateFormat';
import { attendanceRepository } from '../repositories';
import type { AttendanceRecord } from '../types/entities';

export function DashboardPage() {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { exceptions, isLoading: exceptionsLoading } = useAllExceptions();
  const { departments, isLoading: deptLoading } = useDepartmentsAndUnits();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord[] | null>(null);

  useEffect(() => {
    attendanceRepository.getAll().then((all) => {
      setTodayAttendance(all.filter((r) => r.date === isoDateToday()));
    });
  }, []);

  const stats = useMemo(() => {
    const activeEmployees = employees.filter((e) => e.status === EmployeeStatus.ACTIVE);
    const pendingEmployees = employees.filter((e) => e.status === EmployeeStatus.PENDING);
    const startedNotOnboarded = pendingEmployees.filter(
      (e) => e.attendanceSystemStatus === SystemLinkStatus.ACTIVE,
    );
    const missingAttendanceMethod = employees.filter(
      (e) => e.status !== EmployeeStatus.TERMINATED && e.attendanceMethod === 'NONE',
    );
    const pendingPayroll = employees.filter((e) => e.payrollSystemStatus === SystemLinkStatus.PENDING);
    const pendingAttendanceActivation = employees.filter(
      (e) => e.attendanceSystemStatus === SystemLinkStatus.PENDING,
    );
    const openExceptions = exceptions.filter(
      (e) => e.status === ExceptionStatus.OPEN || e.status === ExceptionStatus.PENDING_APPROVAL,
    );
    const pendingApprovals = exceptions.filter((e) => e.status === ExceptionStatus.PENDING_APPROVAL);

    const activeIdsWithAttendanceToday = new Set((todayAttendance ?? []).map((r) => r.employeeId));
    const missingAttendanceToday = activeEmployees.filter(
      (e) => e.attendanceSystemStatus === SystemLinkStatus.ACTIVE && !activeIdsWithAttendanceToday.has(e.id),
    );

    const byDepartment = departments.map((dept) => ({
      department: dept,
      count: employees.filter((e) => e.primaryDepartmentId === dept.id).length,
    }));

    return {
      activeCount: activeEmployees.length,
      pendingCount: pendingEmployees.length,
      startedNotOnboardedCount: startedNotOnboarded.length,
      missingAttendanceMethodCount: missingAttendanceMethod.length,
      pendingPayrollCount: pendingPayroll.length,
      pendingAttendanceActivationCount: pendingAttendanceActivation.length,
      openExceptionsCount: openExceptions.length,
      pendingApprovalsCount: pendingApprovals.length,
      missingAttendanceTodayCount: missingAttendanceToday.length,
      byDepartment,
    };
  }, [employees, exceptions, departments, todayAttendance]);

  const isLoading = employeesLoading || exceptionsLoading || deptLoading || todayAttendance === null;
  if (isLoading) return <LoadingState message="טוען נתוני דשבורד..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">דשבורד משאבי אנוש</h1>
        <p className="mt-1 text-sm text-gray-500">תמונת מצב תפעולית מרכזית של כלל העובדים בארגון</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <KpiCard label="עובדים פעילים" value={stats.activeCount} icon={Users} tone="success" to="/employees?status=ACTIVE" />
        <KpiCard
          label="עובדים ממתינים לקליטה"
          value={stats.pendingCount}
          icon={Hourglass}
          tone="warning"
          to="/employees/pending"
        />
        <KpiCard
          label="החלו עבודה - קליטה לא הושלמה"
          value={stats.startedNotOnboardedCount}
          icon={Clock3}
          tone="warning"
          to="/employees/pending"
        />
        <KpiCard
          label="חסרה נוכחות היום"
          value={stats.missingAttendanceTodayCount}
          icon={AlertTriangle}
          tone="danger"
          to="/employees?missingAttendanceToday=1"
        />
        <KpiCard
          label="חריגי נוכחות פתוחים"
          value={stats.openExceptionsCount}
          icon={AlertTriangle}
          tone="danger"
          to="/exceptions"
        />
        <KpiCard
          label="ממתין לאישור מנהל"
          value={stats.pendingApprovalsCount}
          icon={CheckCircle2}
          tone="warning"
          to="/exceptions?status=PENDING_APPROVAL"
        />
        <KpiCard
          label="ללא שיטת דיווח נוכחות"
          value={stats.missingAttendanceMethodCount}
          icon={UserX}
          tone="default"
          to="/employees?attendanceMethod=NONE"
        />
        <KpiCard
          label="ממתין לקליטה לשכר"
          value={stats.pendingPayrollCount}
          icon={Wallet}
          tone="warning"
          to="/employees?payrollStatus=PENDING"
        />
        <KpiCard
          label="ממתין להפעלת נוכחות"
          value={stats.pendingAttendanceActivationCount}
          icon={Clock3}
          tone="warning"
          to="/employees?attendanceStatus=PENDING"
        />
      </div>

      <Card title="עובדים לפי מחלקה">
        <div className="space-y-2">
          {stats.byDepartment.map(({ department, count }) => {
            const max = Math.max(...stats.byDepartment.map((d) => d.count), 1);
            return (
              <div key={department.id} className="flex items-center gap-3">
                <Building2 size={14} className="shrink-0 text-gray-400" />
                <div className="w-32 shrink-0 truncate text-sm text-gray-700">{department.name}</div>
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(count / max) * 100}%` }}
                  />
                </div>
                <div className="w-8 shrink-0 text-left text-sm font-medium text-gray-800">{count}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
