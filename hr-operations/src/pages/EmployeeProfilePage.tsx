import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  User2, Phone, Mail, Calendar, Building2, MapPin, UserCog, FileText, History, ClipboardCheck,
} from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/Card';
import { StatusBadge } from '../components/StatusBadge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeAssignments } from '../hooks/useEmployees';
import { useEmployeeAttendance } from '../hooks/useAttendance';
import { useEntityAuditLog } from '../hooks/useAuditLog';
import { useDepartmentsAndUnits } from '../hooks/useDepartments';
import { useEmployees } from '../hooks/useEmployees';
import type { Employee, OnboardingStep } from '../types/entities';
import { EmployeeStatus, OnboardingStepStatus, SystemLinkStatus } from '../types/enums';
import {
  ATTENDANCE_METHOD_LABELS,
  ATTENDANCE_STATUS_LABELS,
  EMPLOYEE_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  ONBOARDING_STEP_LABELS,
  SYSTEM_LINK_STATUS_LABELS,
} from '../config/labels';
import { ATTENDANCE_STATUS_TONE, EMPLOYEE_STATUS_TONE, SYSTEM_LINK_STATUS_TONE } from '../config/badgeColors';
import { formatDateIL, formatDateTimeIL, formatWorkedHours } from '../utils/dateFormat';
import {
  canApproveNewEmployeeForAttendance,
  canEditEmployee,
  canUpdateOnboardingStatus,
} from '../permissions/policies';
import {
  advanceHrOnboardingStep,
  advancePayrollSetup,
  approveEmployeeForAttendance,
  getEmployeeById,
  updateEmployeeStatus,
} from '../services/employeeService';
import { getOnboardingTimeline } from '../services/onboardingService';

const TABS = ['overview', 'attendance', 'assignments', 'onboarding', 'documents', 'activity'] as const;
type Tab = (typeof TABS)[number];
const TAB_LABELS: Record<Tab, string> = {
  overview: 'סקירה כללית',
  attendance: 'נוכחות',
  assignments: 'שיוכים ארגוניים',
  onboarding: 'קליטה',
  documents: 'מסמכים',
  activity: 'פעילות',
};

export function EmployeeProfilePage() {
  const { id } = useParams<{ id: string }>();
  const currentUser = useAuthStore((s) => s.currentUser);
  const [employee, setEmployee] = useState<Employee | null | undefined>(undefined);
  const [tab, setTab] = useState<Tab>('overview');
  const [timeline, setTimeline] = useState<OnboardingStep[]>([]);

  const { departments, units } = useDepartmentsAndUnits();
  const { employees } = useEmployees();
  const { assignments } = useEmployeeAssignments(id ?? null);
  const { records: attendanceRecords, isLoading: attendanceLoading } = useEmployeeAttendance(id ?? null);
  const { events: auditEvents } = useEntityAuditLog('Employee', id ?? null);

  async function reloadEmployee() {
    if (!id) return;
    const data = await getEmployeeById(id);
    setEmployee(data);
    setTimeline(await getOnboardingTimeline(id));
  }

  useEffect(() => {
    reloadEmployee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (employee === undefined) return <LoadingState message="טוען פרטי עובד..." />;
  if (employee === null) return <EmptyState message="עובד/ת לא נמצא/ה" />;
  if (!currentUser) return null;

  const department = departments.find((d) => d.id === employee.primaryDepartmentId);
  const unit = units.find((u) => u.id === employee.primaryUnitId);
  const manager = employee.primaryManagerId ? employees.find((e) => e.id === employee.primaryManagerId) : null;

  const editable = canEditEmployee(currentUser, employee, assignments);
  const canApproveAttendance = canApproveNewEmployeeForAttendance(currentUser, employee, assignments);
  const canOnboard = canUpdateOnboardingStatus(currentUser, employee, assignments);

  async function handleApproveAttendance() {
    if (!currentUser) return;
    await approveEmployeeForAttendance(employee!.id, employee!.attendanceMethod === 'NONE' ? 'APP' : employee!.attendanceMethod, currentUser);
    reloadEmployee();
  }

  async function handleHrStep(
    step:
      | typeof OnboardingStepStatus.HR_REVIEW
      | typeof OnboardingStepStatus.MISSING_DOCUMENTS
      | typeof OnboardingStepStatus.DOCUMENTS_COMPLETE,
  ) {
    if (!currentUser) return;
    await advanceHrOnboardingStep(employee!.id, step, currentUser);
    reloadEmployee();
  }

  async function handlePayrollSetup() {
    if (!currentUser) return;
    await advancePayrollSetup(employee!.id, currentUser);
    reloadEmployee();
  }

  async function handleStatusChange(status: EmployeeStatus) {
    if (!currentUser) return;
    await updateEmployeeStatus(employee!.id, status, currentUser);
    reloadEmployee();
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[
          { label: 'עובדים', to: '/employees' },
          { label: `${employee.firstName} ${employee.lastName}` },
        ]}
      />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <User2 size={26} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h1>
              <p className="text-sm text-gray-500">{employee.roleTitle}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Building2 size={12} /> {department?.name ?? '—'}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {unit?.name ?? '—'}
                </span>
                <span className="flex items-center gap-1">
                  <UserCog size={12} /> {manager ? `${manager.firstName} ${manager.lastName}` : 'ללא מנהל משויך'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={EMPLOYEE_STATUS_LABELS[employee.status]} tone={EMPLOYEE_STATUS_TONE[employee.status]} />
            <StatusBadge
              label={`נוכחות: ${SYSTEM_LINK_STATUS_LABELS[employee.attendanceSystemStatus]}`}
              tone={SYSTEM_LINK_STATUS_TONE[employee.attendanceSystemStatus]}
            />
            <StatusBadge
              label={`HR: ${SYSTEM_LINK_STATUS_LABELS[employee.hrSystemStatus]}`}
              tone={SYSTEM_LINK_STATUS_TONE[employee.hrSystemStatus]}
            />
            <StatusBadge
              label={`שכר: ${SYSTEM_LINK_STATUS_LABELS[employee.payrollSystemStatus]}`}
              tone={SYSTEM_LINK_STATUS_TONE[employee.payrollSystemStatus]}
            />
          </div>
        </div>

        {editable && employee.status !== EmployeeStatus.TERMINATED && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
            {employee.status === EmployeeStatus.ACTIVE && (
              <button onClick={() => handleStatusChange(EmployeeStatus.SUSPENDED)} className="btn-outline text-amber-700">
                השעיית עובד/ת
              </button>
            )}
            {employee.status === EmployeeStatus.SUSPENDED && (
              <button onClick={() => handleStatusChange(EmployeeStatus.ACTIVE)} className="btn-outline text-emerald-700">
                חידוש פעילות
              </button>
            )}
            <button onClick={() => handleStatusChange(EmployeeStatus.TERMINATED)} className="btn-outline text-red-700">
              סיום העסקה
            </button>
          </div>
        )}
      </Card>

      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium ${
              tab === t ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <Card title="פרטי עובד/ת">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoRow icon={FileText} label="תעודת זהות (דמו)" value={employee.nationalId} />
            <InfoRow icon={Phone} label="טלפון" value={employee.phone} />
            <InfoRow icon={Mail} label="אימייל" value={employee.email} />
            <InfoRow icon={Calendar} label="תאריך תחילת עבודה" value={formatDateIL(employee.startDate)} />
            <InfoRow icon={ClipboardCheck} label="סוג העסקה" value={EMPLOYMENT_TYPE_LABELS[employee.employmentType]} />
            <InfoRow icon={History} label="שיטת דיווח נוכחות" value={ATTENDANCE_METHOD_LABELS[employee.attendanceMethod]} />
          </dl>
          {employee.notes && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{employee.notes}</div>
          )}
        </Card>
      )}

      {tab === 'attendance' && (
        <Card title="היסטוריית נוכחות">
          {attendanceLoading ? (
            <LoadingState />
          ) : attendanceRecords.length === 0 ? (
            <EmptyState message="אין רשומות נוכחות עבור עובד/ת זה/זו" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-gray-500">
                  <tr>
                    <th className="px-2 py-2 text-right font-medium">תאריך</th>
                    <th className="px-2 py-2 text-right font-medium">כניסה</th>
                    <th className="px-2 py-2 text-right font-medium">יציאה</th>
                    <th className="px-2 py-2 text-right font-medium">שעות עבודה</th>
                    <th className="px-2 py-2 text-right font-medium">סטטוס</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {attendanceRecords.slice(0, 31).map((r) => (
                    <tr key={r.id}>
                      <td className="px-2 py-2">{formatDateIL(r.date)}</td>
                      <td className="px-2 py-2">{r.clockIn ?? '—'}</td>
                      <td className="px-2 py-2">{r.clockOut ?? '—'}</td>
                      <td className="px-2 py-2">{formatWorkedHours(r.workedMinutes)}</td>
                      <td className="px-2 py-2">
                        <StatusBadge label={ATTENDANCE_STATUS_LABELS[r.status]} tone={ATTENDANCE_STATUS_TONE[r.status]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab === 'assignments' && (
        <Card title="שיוכים ארגוניים">
          <p className="mb-3 text-xs text-gray-400">
            עובד/ת יכול/ה להיות משויך/ת ליותר ממחלקה/יחידה אחת. השיוך המסומן כ"ראשי" הוא זה המוצג כברירת מחדל בטבלאות.
          </p>
          {assignments.length === 0 ? (
            <EmptyState message="לא נמצאו שיוכים ארגוניים" />
          ) : (
            <div className="space-y-2">
              {assignments.map((a) => {
                const aDept = departments.find((d) => d.id === a.departmentId);
                const aUnit = units.find((u) => u.id === a.unitId);
                const aManager = a.managerId ? employees.find((e) => e.id === a.managerId) : null;
                return (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 p-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{aDept?.name}</span>
                      <span className="text-gray-400"> · </span>
                      <span className="text-gray-700">{aUnit?.name}</span>
                      <span className="text-gray-400"> · </span>
                      <span className="text-gray-500">{a.roleTitle}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      {aManager && <span>מנהל/ת: {aManager.firstName} {aManager.lastName}</span>}
                      {a.isPrimary && <StatusBadge label="שיוך ראשי" tone="blue" />}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {tab === 'onboarding' && (
        <div className="space-y-4">
          {canOnboard && employee.status === EmployeeStatus.PENDING && (
            <Card title="פעולות קליטה">
              <div className="flex flex-wrap gap-2">
                {canApproveAttendance && employee.attendanceSystemStatus !== SystemLinkStatus.ACTIVE && (
                  <button onClick={handleApproveAttendance} className="btn-primary">
                    אישור לדיווח נוכחות מיידי
                  </button>
                )}
                {employee.hrSystemStatus !== SystemLinkStatus.ACTIVE && (
                  <>
                    <button onClick={() => handleHrStep(OnboardingStepStatus.HR_REVIEW)} className="btn-outline">
                      סמן: בבדיקת HR
                    </button>
                    <button onClick={() => handleHrStep(OnboardingStepStatus.MISSING_DOCUMENTS)} className="btn-outline text-amber-700">
                      סמן: חסרים מסמכים
                    </button>
                    <button onClick={() => handleHrStep(OnboardingStepStatus.DOCUMENTS_COMPLETE)} className="btn-outline text-emerald-700">
                      סמן: מסמכים הושלמו
                    </button>
                  </>
                )}
                {employee.hrSystemStatus === SystemLinkStatus.ACTIVE && employee.payrollSystemStatus !== SystemLinkStatus.ACTIVE && (
                  <button onClick={handlePayrollSetup} className="btn-primary">
                    סמן: קליטה לשכר הושלמה
                  </button>
                )}
              </div>
            </Card>
          )}

          <Card title="ציר זמן קליטה">
            {timeline.length === 0 ? (
              <EmptyState message="אין עדיין אירועי קליטה" />
            ) : (
              <ol className="space-y-4 border-r-2 border-gray-100 pr-4">
                {timeline.map((step) => (
                  <li key={step.id} className="relative">
                    <span className="absolute -right-[21px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
                    <div className="text-sm font-medium text-gray-900">{ONBOARDING_STEP_LABELS[step.step]}</div>
                    <div className="text-xs text-gray-400">{formatDateTimeIL(step.completedAt)}</div>
                    {step.notes && <div className="mt-0.5 text-xs text-gray-500">{step.notes}</div>}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      )}

      {tab === 'documents' && (
        <Card title="מסמכים">
          <EmptyState message="מודול המסמכים הוא הדגמה בלבד בשלב זה - אין העלאה או אחסון מסמכים אמיתיים" />
        </Card>
      )}

      {tab === 'activity' && (
        <Card title="יומן פעילות">
          {auditEvents.length === 0 ? (
            <EmptyState message="אין רשומות פעילות עבור עובד/ת זה/זו" />
          ) : (
            <ul className="space-y-3">
              {auditEvents.map((event) => (
                <li key={event.id} className="border-b border-gray-100 pb-3 text-sm last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{event.details}</span>
                    <span className="text-xs text-gray-400">{formatDateTimeIL(event.timestamp)}</span>
                  </div>
                  <div className="text-xs text-gray-400">בוצע על ידי: {event.userDisplayName}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof User2; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={16} className="shrink-0 text-gray-400" />
      <div>
        <dt className="text-xs text-gray-400">{label}</dt>
        <dd className="text-sm font-medium text-gray-800">{value}</dd>
      </div>
    </div>
  );
}
