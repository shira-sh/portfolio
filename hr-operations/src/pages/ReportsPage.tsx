import { useMemo } from 'react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/Card';
import { LoadingState } from '../components/LoadingState';
import { useEmployees } from '../hooks/useEmployees';
import { useDepartmentsAndUnits } from '../hooks/useDepartments';
import { useAllExceptions } from '../hooks/useAttendance';
import { EmployeeStatus, ExceptionStatus, SystemLinkStatus } from '../types/enums';

export function ReportsPage() {
  const { employees, isLoading: employeesLoading } = useEmployees();
  const { departments, isLoading: deptLoading } = useDepartmentsAndUnits();
  const { exceptions, isLoading: exceptionsLoading } = useAllExceptions();

  const byDepartment = useMemo(
    () => departments.map((d) => ({ name: d.name, count: employees.filter((e) => e.primaryDepartmentId === d.id).length })),
    [departments, employees],
  );

  const pendingOnboarding = employees.filter((e) => e.status === EmployeeStatus.PENDING);
  const missingAttendanceMethod = employees.filter((e) => e.attendanceMethod === 'NONE');
  const openExceptions = exceptions.filter(
    (e) => e.status === ExceptionStatus.OPEN || e.status === ExceptionStatus.PENDING_APPROVAL,
  );
  const pendingAttendanceActivation = employees.filter((e) => e.attendanceSystemStatus === SystemLinkStatus.PENDING);

  if (employeesLoading || deptLoading || exceptionsLoading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'דשבורד', to: '/dashboard' }, { label: 'דוחות' }]} />
      <h1 className="text-xl font-bold text-gray-900">דוחות סיכום</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card title="עובדים לפי מחלקה">
          <ul className="space-y-1.5 text-sm">
            {byDepartment.map((row) => (
              <li key={row.name} className="flex justify-between border-b border-gray-50 py-1">
                <span className="text-gray-700">{row.name}</span>
                <span className="font-medium text-gray-900">{row.count}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="ממתינים לקליטה">
          <p className="text-3xl font-bold text-gray-900">{pendingOnboarding.length}</p>
          <p className="text-sm text-gray-500">עובדים שסטטוסם הכללי הוא "ממתין לקליטה"</p>
        </Card>

        <Card title="חריגי נוכחות פתוחים">
          <p className="text-3xl font-bold text-gray-900">{openExceptions.length}</p>
          <p className="text-sm text-gray-500">כולל חריגים הממתינים לאישור מנהל</p>
        </Card>

        <Card title="נוכחות חסרה / לא מוגדרת">
          <p className="text-3xl font-bold text-gray-900">{missingAttendanceMethod.length}</p>
          <p className="text-sm text-gray-500">עובדים ללא שיטת דיווח נוכחות מוגדרת</p>
        </Card>

        <Card title="ממתינים להפעלת נוכחות">
          <p className="text-3xl font-bold text-gray-900">{pendingAttendanceActivation.length}</p>
          <p className="text-sm text-gray-500">עובדים הממתינים לאישור מנהל ישיר לדיווח נוכחות</p>
        </Card>
      </div>
    </div>
  );
}
