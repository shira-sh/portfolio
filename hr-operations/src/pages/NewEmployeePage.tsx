import { useMemo, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { Card } from '../components/Card';
import { useEmployees } from '../hooks/useEmployees';
import { useDepartmentsAndUnits } from '../hooks/useDepartments';
import { useAuthStore } from '../stores/authStore';
import { createPendingEmployee } from '../services/employeeService';
import { EmploymentType } from '../types/enums';
import { EMPLOYMENT_TYPE_LABELS, ATTENDANCE_METHOD_LABELS } from '../config/labels';
import { isoDateToday } from '../utils/dateFormat';

const schema = z.object({
  firstName: z.string().min(2, 'שם פרטי חובה'),
  lastName: z.string().min(2, 'שם משפחה חובה'),
  nationalId: z.string().regex(/^\d{9}$/, 'תעודת זהות חייבת להכיל 9 ספרות'),
  phone: z.string().min(9, 'מספר טלפון לא תקין'),
  email: z.string().email('כתובת אימייל לא תקינה'),
  roleTitle: z.string().min(2, 'תפקיד חובה'),
  employmentType: z.nativeEnum(EmploymentType),
  departmentId: z.string().min(1, 'יש לבחור מחלקה'),
  unitId: z.string().min(1, 'יש לבחור יחידה'),
  managerId: z.string(),
  startDate: z.string().min(1, 'יש לבחור תאריך התחלה'),
  attendanceMethod: z.enum(['APP', 'PHONE', 'CLOCK', 'MANUAL', 'NONE']),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NewEmployeePage() {
  const { departments, units } = useDepartmentsAndUnits();
  const { employees } = useEmployees();
  const currentUser = useAuthStore((s) => s.currentUser);
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employmentType: EmploymentType.FULL_TIME,
      startDate: isoDateToday(),
      attendanceMethod: 'APP',
      managerId: '',
      notes: '',
    },
  });

  const selectedDepartmentId = watch('departmentId');
  const unitsForDepartment = useMemo(
    () => units.filter((u) => u.departmentId === selectedDepartmentId),
    [units, selectedDepartmentId],
  );

  async function onSubmit(values: FormValues) {
    if (!currentUser) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const employee = await createPendingEmployee(
        {
          ...values,
          managerId: values.managerId || null,
          notes: values.notes ?? '',
        },
        currentUser,
      );
      navigate(`/employees/${employee.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'שמירת העובד נכשלה');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Breadcrumbs items={[{ label: 'עובדים', to: '/employees' }, { label: 'הוספת עובד' }]} />
      <h1 className="text-xl font-bold text-gray-900">הוספת עובד/ת חדש/ה</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="שם פרטי" error={errors.firstName?.message}>
              <input {...register('firstName')} className="input" />
            </Field>
            <Field label="שם משפחה" error={errors.lastName?.message}>
              <input {...register('lastName')} className="input" />
            </Field>
            <Field label="תעודת זהות" error={errors.nationalId?.message}>
              <input {...register('nationalId')} className="input" placeholder="9 ספרות (דמו)" />
            </Field>
            <Field label="טלפון" error={errors.phone?.message}>
              <input {...register('phone')} className="input" />
            </Field>
            <Field label="אימייל" error={errors.email?.message}>
              <input {...register('email')} className="input" />
            </Field>
            <Field label="תפקיד" error={errors.roleTitle?.message}>
              <input {...register('roleTitle')} className="input" />
            </Field>

            <Field label="מחלקה" error={errors.departmentId?.message}>
              <select {...register('departmentId')} className="input">
                <option value="">בחר/י מחלקה</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="יחידה / אתר" error={errors.unitId?.message}>
              <select {...register('unitId')} className="input" disabled={!selectedDepartmentId}>
                <option value="">בחר/י יחידה</option>
                {unitsForDepartment.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="מנהל/ת ישיר/ה">
              <select {...register('managerId')} className="input">
                <option value="">ללא / טרם שובץ</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} - {e.roleTitle}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="סוג העסקה">
              <select {...register('employmentType')} className="input">
                {Object.values(EmploymentType).map((t) => (
                  <option key={t} value={t}>
                    {EMPLOYMENT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="תאריך התחלה" error={errors.startDate?.message}>
              <input type="date" {...register('startDate')} className="input" />
            </Field>
            <Field label="שיטת דיווח נוכחות">
              <select {...register('attendanceMethod')} className="input">
                {Object.entries(ATTENDANCE_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="הערות">
            <textarea {...register('notes')} rows={2} className="input" />
          </Field>

          {currentUser?.role === 'MANAGER' && (
            <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
              כמנהל/ת ישיר/ה, אישור טופס זה יאפשר לעובד/ת לדווח נוכחות מיידית, גם לפני השלמת קליטה מול HR ושכר.
            </div>
          )}

          {submitError && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} />
              {submitError}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'שומר...' : 'הוסף עובד'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-gray-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
