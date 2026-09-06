import { useState } from 'react';
import { Clock, LogIn, LogOut, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeAttendance } from '../hooks/useAttendance';
import { clockIn, clockOut } from '../services/attendanceService';
import { StatusBadge } from '../components/StatusBadge';
import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ATTENDANCE_STATUS_LABELS } from '../config/labels';
import { ATTENDANCE_STATUS_TONE } from '../config/badgeColors';
import { formatDateIL, formatWorkedHours } from '../utils/dateFormat';

export function AttendancePage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const employeeId = currentUser?.employeeId ?? null;
  const { records, today, isLoading, refetch } = useEmployeeAttendance(employeeId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentUser) return null;

  if (!employeeId) {
    return (
      <div className="mx-auto max-w-md pt-10">
        <EmptyState message="חשבון המשתמש אינו מקושר לרשומת עובד - לא ניתן לדווח נוכחות" />
      </div>
    );
  }

  const todayLabel = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' });

  async function handleClockIn() {
    setActionError(null);
    setIsSubmitting(true);
    try {
      await clockIn(employeeId!, currentUser!);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'הפעולה נכשלה');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClockOut() {
    setActionError(null);
    setIsSubmitting(true);
    try {
      await clockOut(employeeId!, currentUser!);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'הפעולה נכשלה');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-10">
      <div className="rounded-2xl bg-gradient-to-l from-blue-600 to-blue-500 p-6 text-white shadow-sm">
        <p className="text-sm text-blue-100">שלום, {currentUser.displayName.split(' (')[0]}</p>
        <p className="text-xs text-blue-100">{todayLabel}</p>

        <div className="mt-5 flex flex-col items-center gap-3">
          {!today?.clockIn && (
            <button
              onClick={handleClockIn}
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-base font-bold text-blue-700 shadow disabled:opacity-60"
            >
              <LogIn size={20} />
              דווח כניסה
            </button>
          )}

          {today?.clockIn && !today.clockOut && (
            <>
              <div className="flex items-center gap-2 text-sm text-blue-50">
                <Clock size={16} /> נכנסת בשעה {today.clockIn}
              </div>
              <button
                onClick={handleClockOut}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-base font-bold text-blue-700 shadow disabled:opacity-60"
              >
                <LogOut size={20} />
                דווח יציאה
              </button>
            </>
          )}

          {today?.clockIn && today.clockOut && (
            <div className="w-full rounded-xl bg-white/10 p-4 text-center">
              <div className="text-sm text-blue-50">
                {today.clockIn} - {today.clockOut}
              </div>
              <div className="mt-1 text-lg font-bold">עבדת היום: {formatWorkedHours(today.workedMinutes)}</div>
            </div>
          )}
        </div>

        {actionError && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/20 p-2.5 text-sm text-white">
            <AlertCircle size={16} />
            {actionError}
          </div>
        )}
      </div>

      <Card title="נוכחות חודשית">
        {isLoading ? null : records.length === 0 ? (
          <EmptyState message="עדיין אין רשומות נוכחות" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-500">
                <tr>
                  <th className="px-2 py-2 text-right font-medium">תאריך</th>
                  <th className="px-2 py-2 text-right font-medium">כניסה</th>
                  <th className="px-2 py-2 text-right font-medium">יציאה</th>
                  <th className="px-2 py-2 text-right font-medium">שעות</th>
                  <th className="px-2 py-2 text-right font-medium">סטטוס</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.slice(0, 31).map((r) => (
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
    </div>
  );
}
