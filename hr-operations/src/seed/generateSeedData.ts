import { createEmptyDatabase, type Database } from '../types/database';
import type {
  AttendanceException,
  AttendanceRecord,
  Department,
  Employee,
  EmployeeAssignment,
  OnboardingRequest,
  OnboardingStep,
  Unit,
  User,
} from '../types/entities';
import {
  AttendanceStatus,
  EmployeeStatus,
  EmploymentType,
  ExceptionStatus,
  ExceptionType,
  OnboardingStepStatus,
  SystemLinkStatus,
  UserRole,
} from '../types/enums';
import { fakeEmail, fakeFullName, fakeNationalId, fakePhone } from './fakeNames';

/** Deterministic pseudo-random generator so re-running the seed script produces
 * the same demo dataset (useful for stable screenshots/demos). */
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function randInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

let idCounter = 0;
function seedId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${String(idCounter).padStart(5, '0')}`;
}

const NOW = new Date();
function isoDate(daysAgo: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}
function isoTimestamp(daysAgo: number): string {
  const d = new Date(NOW);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

interface DepartmentSeed {
  name: string;
  code: string;
  units: string[];
}

const DEPARTMENT_SEED: DepartmentSeed[] = [
  { name: 'משאבי אנוש', code: 'HR', units: ['מטה משאבי אנוש'] },
  { name: 'כספים', code: 'FIN', units: ['מטה כספים', 'חשבות שכר'] },
  { name: 'קהילה', code: 'COMM', units: ['מרכז קהילתי א׳', 'מרכז קהילתי ב׳', 'מרכז קהילתי ג׳'] },
  { name: 'חינוך משלים', code: 'EDU', units: ['צהרון א׳', 'צהרון ב׳', 'צהרון ג׳'] },
  { name: 'בריכות שחייה', code: 'POOL', units: ['בריכה א׳', 'בריכה ב׳'] },
  { name: 'תיאטראות', code: 'THTR', units: ['תיאטרון א׳', 'תיאטרון ב׳'] },
  { name: 'דיגיטל', code: 'DIG', units: ['מטה דיגיטל'] },
  { name: 'מטה', code: 'HQ', units: ['הנהלה כללית', 'מוקד שירות'] },
];

const EMPLOYMENT_TYPES: EmploymentType[] = [
  EmploymentType.FULL_TIME,
  EmploymentType.FULL_TIME,
  EmploymentType.PART_TIME,
  EmploymentType.HOURLY,
];

const ROLE_TITLES = [
  'רכז/ת תפעול', 'מדריך/ה', 'רכז/ת קבוצה', 'עובד/ת שירות', 'רכז/ת פעילות',
  'מציל/ה', 'מדריך/ת שחייה', 'טכנאי/ת במה', 'רכז/ת דיגיטל', 'עובד/ת מנהלה',
];

export function generateSeedData(): Database {
  const db = createEmptyDatabase();

  // ---- Departments & Units ----
  const departments: Department[] = [];
  const units: Unit[] = [];
  const unitsByDepartment = new Map<string, Unit[]>();

  for (const seed of DEPARTMENT_SEED) {
    const department: Department = {
      id: seedId('dept'),
      name: seed.name,
      code: seed.code,
      parentDepartmentId: null,
      isActive: true,
    };
    departments.push(department);
    const deptUnits: Unit[] = seed.units.map((unitName) => ({
      id: seedId('unit'),
      departmentId: department.id,
      name: unitName,
      code: unitName.slice(0, 3),
      address: null,
      isActive: true,
    }));
    units.push(...deptUnits);
    unitsByDepartment.set(department.id, deptUnits);
  }

  db.departments = departments;
  db.units = units;

  // ---- Managers (one per unit = 15 managers) ----
  const employees: Employee[] = [];
  const assignments: EmployeeAssignment[] = [];
  const managerIdByUnit = new Map<string, string>();

  let nameIndex = 0;
  for (const unit of units) {
    const { firstName, lastName } = fakeFullName(nameIndex++);
    const manager: Employee = {
      id: seedId('emp'),
      nationalId: fakeNationalId(nameIndex),
      firstName,
      lastName,
      phone: fakePhone(nameIndex),
      email: fakeEmail(nameIndex),
      status: EmployeeStatus.ACTIVE,
      employmentType: EmploymentType.FULL_TIME,
      roleTitle: `מנהל/ת ${unit.name}`,
      primaryDepartmentId: unit.departmentId,
      primaryUnitId: unit.id,
      primaryManagerId: null,
      startDate: isoDate(randInt(400, 2000)),
      endDate: null,
      attendanceMethod: 'APP',
      hrSystemStatus: SystemLinkStatus.ACTIVE,
      payrollSystemStatus: SystemLinkStatus.ACTIVE,
      attendanceSystemStatus: SystemLinkStatus.ACTIVE,
      notes: '',
      createdAt: isoTimestamp(randInt(400, 2000)),
      updatedAt: isoTimestamp(randInt(1, 30)),
    };
    employees.push(manager);
    assignments.push({
      id: seedId('asg'),
      employeeId: manager.id,
      departmentId: unit.departmentId,
      unitId: unit.id,
      managerId: null,
      roleTitle: manager.roleTitle,
      isPrimary: true,
      startDate: manager.startDate,
      endDate: null,
    });
    managerIdByUnit.set(unit.id, manager.id);
  }

  // ---- Regular active employees (target ~150 total incl. managers) ----
  const REGULAR_EMPLOYEE_COUNT = 135;
  for (let i = 0; i < REGULAR_EMPLOYEE_COUNT; i++) {
    const { firstName, lastName } = fakeFullName(nameIndex++);
    const unit = pick(units);
    const managerId = managerIdByUnit.get(unit.id) ?? null;
    const employee: Employee = {
      id: seedId('emp'),
      nationalId: fakeNationalId(nameIndex),
      firstName,
      lastName,
      phone: fakePhone(nameIndex),
      email: fakeEmail(nameIndex),
      status: EmployeeStatus.ACTIVE,
      employmentType: pick(EMPLOYMENT_TYPES),
      roleTitle: pick(ROLE_TITLES),
      primaryDepartmentId: unit.departmentId,
      primaryUnitId: unit.id,
      primaryManagerId: managerId,
      startDate: isoDate(randInt(30, 1800)),
      endDate: null,
      attendanceMethod: pick(['APP', 'PHONE', 'CLOCK'] as const),
      hrSystemStatus: SystemLinkStatus.ACTIVE,
      payrollSystemStatus: SystemLinkStatus.ACTIVE,
      attendanceSystemStatus: SystemLinkStatus.ACTIVE,
      notes: '',
      createdAt: isoTimestamp(randInt(30, 1800)),
      updatedAt: isoTimestamp(randInt(1, 30)),
    };
    employees.push(employee);
    assignments.push({
      id: seedId('asg'),
      employeeId: employee.id,
      departmentId: unit.departmentId,
      unitId: unit.id,
      managerId,
      roleTitle: employee.roleTitle,
      isPrimary: true,
      startDate: employee.startDate,
      endDate: null,
    });

    // A handful of employees also work a second unit/department, per the
    // confirmed multi-department requirement (see ARCHITECTURE.md section 4.2).
    if (i % 18 === 0) {
      const secondUnit = pick(units);
      if (secondUnit.id !== unit.id) {
        assignments.push({
          id: seedId('asg'),
          employeeId: employee.id,
          departmentId: secondUnit.departmentId,
          unitId: secondUnit.id,
          managerId: managerIdByUnit.get(secondUnit.id) ?? null,
          roleTitle: employee.roleTitle,
          isPrimary: false,
          startDate: isoDate(randInt(10, 300)),
          endDate: null,
        });
      }
    }
  }

  // ---- Pending employees (20) - already working, onboarding in progress ----
  const onboardingRequests: OnboardingRequest[] = [];
  const onboardingSteps: OnboardingStep[] = [];
  const PENDING_STAGES: Array<{
    hr: SystemLinkStatus;
    payroll: SystemLinkStatus;
    attendance: SystemLinkStatus;
    step: OnboardingStepStatus;
  }> = [
    { hr: SystemLinkStatus.PENDING, payroll: SystemLinkStatus.NOT_STARTED, attendance: SystemLinkStatus.ACTIVE, step: OnboardingStepStatus.ATTENDANCE_ACTIVATED },
    { hr: SystemLinkStatus.PENDING, payroll: SystemLinkStatus.NOT_STARTED, attendance: SystemLinkStatus.PENDING, step: OnboardingStepStatus.REQUESTED },
    { hr: SystemLinkStatus.PENDING, payroll: SystemLinkStatus.NOT_STARTED, attendance: SystemLinkStatus.ACTIVE, step: OnboardingStepStatus.HR_REVIEW },
    { hr: SystemLinkStatus.PENDING, payroll: SystemLinkStatus.NOT_STARTED, attendance: SystemLinkStatus.ACTIVE, step: OnboardingStepStatus.MISSING_DOCUMENTS },
    { hr: SystemLinkStatus.ACTIVE, payroll: SystemLinkStatus.PENDING, attendance: SystemLinkStatus.ACTIVE, step: OnboardingStepStatus.DOCUMENTS_COMPLETE },
    { hr: SystemLinkStatus.ACTIVE, payroll: SystemLinkStatus.ACTIVE, attendance: SystemLinkStatus.ACTIVE, step: OnboardingStepStatus.PAYROLL_SETUP },
  ];

  const PENDING_EMPLOYEE_COUNT = 20;
  const pendingEmployeeIds: string[] = [];
  for (let i = 0; i < PENDING_EMPLOYEE_COUNT; i++) {
    const { firstName, lastName } = fakeFullName(nameIndex++);
    const unit = pick(units);
    const managerId = managerIdByUnit.get(unit.id) ?? null;
    const stage = PENDING_STAGES[i % PENDING_STAGES.length];
    const createdDaysAgo = randInt(1, 20);

    const employee: Employee = {
      id: seedId('emp'),
      nationalId: fakeNationalId(nameIndex),
      firstName,
      lastName,
      phone: fakePhone(nameIndex),
      email: fakeEmail(nameIndex),
      status: EmployeeStatus.PENDING,
      employmentType: pick(EMPLOYMENT_TYPES),
      roleTitle: pick(ROLE_TITLES),
      primaryDepartmentId: unit.departmentId,
      primaryUnitId: unit.id,
      primaryManagerId: managerId,
      startDate: isoDate(createdDaysAgo),
      endDate: null,
      attendanceMethod: stage.attendance === SystemLinkStatus.ACTIVE ? pick(['APP', 'PHONE'] as const) : 'NONE',
      hrSystemStatus: stage.hr,
      payrollSystemStatus: stage.payroll,
      attendanceSystemStatus: stage.attendance,
      notes: '',
      createdAt: isoTimestamp(createdDaysAgo),
      updatedAt: isoTimestamp(randInt(0, createdDaysAgo)),
    };
    employees.push(employee);
    pendingEmployeeIds.push(employee.id);
    assignments.push({
      id: seedId('asg'),
      employeeId: employee.id,
      departmentId: unit.departmentId,
      unitId: unit.id,
      managerId,
      roleTitle: employee.roleTitle,
      isPrimary: true,
      startDate: employee.startDate,
      endDate: null,
    });

    const request: OnboardingRequest = {
      id: seedId('onb'),
      employeeId: employee.id,
      currentStep: stage.step,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
      createdBy: managerId ?? 'system',
    };
    onboardingRequests.push(request);
    onboardingSteps.push({
      id: seedId('step'),
      onboardingRequestId: request.id,
      step: OnboardingStepStatus.REQUESTED,
      completedAt: employee.createdAt,
      completedBy: managerId ?? 'system',
      notes: 'העובד נוצר במערכת על ידי המנהל הישיר',
    });
    if (stage.attendance === SystemLinkStatus.ACTIVE) {
      onboardingSteps.push({
        id: seedId('step'),
        onboardingRequestId: request.id,
        step: OnboardingStepStatus.ATTENDANCE_ACTIVATED,
        completedAt: employee.createdAt,
        completedBy: managerId ?? 'system',
        notes: 'המנהל אישר דיווח נוכחות מיידי',
      });
    }
  }

  db.employees = employees;
  db.employeeAssignments = assignments;
  db.onboardingRequests = onboardingRequests;
  db.onboardingSteps = onboardingSteps;

  // ---- Attendance for a full demo month (weekdays, Sunday-Thursday) ----
  const attendance: AttendanceRecord[] = [];
  const exceptions: AttendanceException[] = [];

  const attendanceEligible = employees.filter((e) => e.attendanceSystemStatus === SystemLinkStatus.ACTIVE);

  for (const employee of attendanceEligible) {
    for (let daysAgo = 1; daysAgo <= 30; daysAgo++) {
      const date = new Date(NOW);
      date.setDate(date.getDate() - daysAgo);
      const dayOfWeek = date.getDay(); // 0=Sunday .. 6=Saturday
      if (dayOfWeek === 5 || dayOfWeek === 6) continue; // Friday/Saturday weekend

      const roll = rand();
      const dateStr = date.toISOString().slice(0, 10);
      const createdAt = date.toISOString();

      if (roll < 0.03) continue; // day off / not worked - skip entirely

      const clockInHour = 7 + randInt(0, 1);
      const clockInMinute = randInt(30, 59);
      const clockIn = `${String(clockInHour).padStart(2, '0')}:${String(clockInMinute).padStart(2, '0')}`;
      const clockOutHour = 15 + randInt(0, 2);
      const clockOutMinute = randInt(0, 59);
      const clockOut = `${String(clockOutHour).padStart(2, '0')}:${String(clockOutMinute).padStart(2, '0')}`;
      const workedMinutes =
        clockOutHour * 60 + clockOutMinute - (clockInHour * 60 + clockInMinute);

      let status: AttendanceStatus = AttendanceStatus.OK;
      let finalClockOut: string | null = clockOut;
      let finalWorkedMinutes: number | null = workedMinutes;

      if (roll < 0.08) {
        status = AttendanceStatus.MISSING_OUT;
        finalClockOut = null;
        finalWorkedMinutes = null;
      } else if (roll < 0.1) {
        status = AttendanceStatus.PENDING_APPROVAL;
      }

      const record: AttendanceRecord = {
        id: seedId('att'),
        employeeId: employee.id,
        date: dateStr,
        clockIn,
        clockOut: finalClockOut,
        workedMinutes: finalWorkedMinutes,
        status,
        source: employee.attendanceMethod === 'NONE' ? 'MANUAL' : (employee.attendanceMethod as AttendanceRecord['source']),
        unitId: employee.primaryUnitId,
        createdAt,
        updatedAt: createdAt,
      };
      attendance.push(record);

      if (status === AttendanceStatus.MISSING_OUT) {
        exceptions.push({
          id: seedId('exc'),
          employeeId: employee.id,
          attendanceRecordId: record.id,
          type: ExceptionType.MISSING_OUT,
          status: ExceptionStatus.OPEN,
          requestedChange: null,
          createdAt,
          resolvedAt: null,
          resolvedBy: null,
        });
      } else if (status === AttendanceStatus.PENDING_APPROVAL) {
        exceptions.push({
          id: seedId('exc'),
          employeeId: employee.id,
          attendanceRecordId: record.id,
          type: ExceptionType.MANAGER_APPROVAL_REQUIRED,
          status: ExceptionStatus.PENDING_APPROVAL,
          requestedChange: 'תיקון שעת יציאה ידני התבקש על ידי העובד',
          createdAt,
          resolvedAt: null,
          resolvedBy: null,
        });
      }
    }
  }

  db.attendance = attendance;
  db.attendanceExceptions = exceptions;

  // ---- Demo Users (login accounts, one per role) ----
  const anyManager = employees.find((e) => e.roleTitle.startsWith('מנהל/ת'));
  const anyRegularEmployee = employees.find((e) => e.status === EmployeeStatus.ACTIVE && !e.roleTitle.startsWith('מנהל/ת'));
  const hrDepartment = departments.find((d) => d.code === 'HR');
  const communityDepartment = departments.find((d) => d.code === 'COMM');
  const eduDepartment = departments.find((d) => d.code === 'EDU');

  const users: User[] = [
    {
      id: seedId('user'),
      employeeId: anyRegularEmployee?.id ?? null,
      displayName: `${anyRegularEmployee?.firstName ?? 'ישראל'} ${anyRegularEmployee?.lastName ?? 'ישראלי'} (עובד/ת)`,
      role: UserRole.EMPLOYEE,
      scopeDepartmentIds: [],
      isActive: true,
    },
    {
      id: seedId('user'),
      employeeId: anyManager?.id ?? null,
      displayName: `${anyManager?.firstName ?? 'מנהל'} ${anyManager?.lastName ?? 'דוגמה'} (מנהל/ת)`,
      role: UserRole.MANAGER,
      scopeDepartmentIds: [],
      isActive: true,
    },
    {
      id: seedId('user'),
      employeeId: null,
      displayName: 'רכזת HR - דוגמה',
      role: UserRole.HR_REFERENT,
      scopeDepartmentIds: [communityDepartment?.id, eduDepartment?.id].filter(Boolean) as string[],
      isActive: true,
    },
    {
      id: seedId('user'),
      employeeId: null,
      displayName: 'מנהל/ת שכר - דוגמה',
      role: UserRole.PAYROLL,
      scopeDepartmentIds: [],
      isActive: true,
    },
    {
      id: seedId('user'),
      employeeId: null,
      displayName: `מנהלת משאבי אנוש (${hrDepartment?.name ?? 'HR'})`,
      role: UserRole.HR_MANAGER,
      scopeDepartmentIds: [],
      isActive: true,
    },
    {
      id: seedId('user'),
      employeeId: null,
      displayName: 'מנהל/ת מערכת',
      role: UserRole.SYSTEM_ADMIN,
      scopeDepartmentIds: [],
      isActive: true,
    },
  ];

  db.users = users;

  db.auditLog = [
    {
      id: seedId('audit'),
      timestamp: isoTimestamp(0),
      userId: 'system',
      userDisplayName: 'המערכת',
      action: 'SEED_DATA_GENERATED',
      entityType: 'System',
      entityId: 'seed',
      details: `נוצר סט נתוני דמו: ${employees.length} עובדים, ${departments.length} מחלקות, ${units.length} יחידות`,
    },
  ];

  return db;
}
