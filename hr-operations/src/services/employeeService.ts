import {
  employeeAssignmentRepository,
  employeeRepository,
  onboardingRepository,
} from '../repositories';
import type { Employee, EmployeeAssignment, User } from '../types/entities';
import {
  EmployeeStatus,
  EmploymentType,
  OnboardingStepStatus,
  SystemLinkStatus,
  UserRole,
  type AttendanceMethod,
} from '../types/enums';
import { newId } from '../utils/id';
import { nowIso } from '../utils/dateFormat';
import { logEvent } from './auditService';

export interface NewEmployeeInput {
  firstName: string;
  lastName: string;
  nationalId: string;
  phone: string;
  email: string;
  roleTitle: string;
  employmentType: EmploymentType;
  departmentId: string;
  unitId: string;
  managerId: string | null;
  startDate: string;
  attendanceMethod: AttendanceMethod;
  notes?: string;
}

export async function getAllEmployees(): Promise<Employee[]> {
  return employeeRepository.getAll();
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  return employeeRepository.getById(id);
}

export async function getAssignmentsForEmployee(employeeId: string): Promise<EmployeeAssignment[]> {
  return employeeAssignmentRepository.getByEmployeeId(employeeId);
}

/** A new employee is created by the direct site/unit manager (or by HR on their
 * behalf). If the creator is a Manager, the act of creation IS the site-level
 * approval described by the business: attendance can start immediately, even
 * though HR and Payroll onboarding are still pending. See ARCHITECTURE.md section
 * "Onboarding & attendance activation" for the reasoning. */
export async function createPendingEmployee(
  input: NewEmployeeInput,
  actingUser: User,
): Promise<Employee> {
  const existing = await employeeRepository.findByNationalId(input.nationalId);
  if (existing) {
    throw new Error(`כבר קיים עובד עם תעודת זהות ${input.nationalId} במערכת`);
  }

  const createdAsManager = actingUser.role === UserRole.MANAGER;
  const timestamp = nowIso();

  const employee: Employee = {
    id: newId(),
    nationalId: input.nationalId,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    email: input.email,
    status: EmployeeStatus.PENDING,
    employmentType: input.employmentType,
    roleTitle: input.roleTitle,
    primaryDepartmentId: input.departmentId,
    primaryUnitId: input.unitId,
    primaryManagerId: input.managerId,
    startDate: input.startDate,
    endDate: null,
    attendanceMethod: createdAsManager ? input.attendanceMethod : 'NONE',
    hrSystemStatus: SystemLinkStatus.PENDING,
    payrollSystemStatus: SystemLinkStatus.NOT_STARTED,
    attendanceSystemStatus: createdAsManager ? SystemLinkStatus.ACTIVE : SystemLinkStatus.PENDING,
    notes: input.notes ?? '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await employeeRepository.create(employee);

  const assignment: EmployeeAssignment = {
    id: newId(),
    employeeId: employee.id,
    departmentId: input.departmentId,
    unitId: input.unitId,
    managerId: input.managerId,
    roleTitle: input.roleTitle,
    isPrimary: true,
    startDate: input.startDate,
    endDate: null,
  };
  await employeeAssignmentRepository.create(assignment);

  const onboardingRequest = await onboardingRepository.create({
    id: newId(),
    employeeId: employee.id,
    currentStep: createdAsManager ? OnboardingStepStatus.ATTENDANCE_ACTIVATED : OnboardingStepStatus.REQUESTED,
    createdAt: timestamp,
    updatedAt: timestamp,
    createdBy: actingUser.id,
  });

  await onboardingRepository.addStep({
    id: newId(),
    onboardingRequestId: onboardingRequest.id,
    step: OnboardingStepStatus.REQUESTED,
    completedAt: timestamp,
    completedBy: actingUser.id,
    notes: 'העובד נוצר במערכת',
  });

  if (createdAsManager) {
    await onboardingRepository.addStep({
      id: newId(),
      onboardingRequestId: onboardingRequest.id,
      step: OnboardingStepStatus.ATTENDANCE_ACTIVATED,
      completedAt: timestamp,
      completedBy: actingUser.id,
      notes: 'המנהל הישיר אישר את העובד לעבודה - דיווח נוכחות פעיל',
    });
  }

  await logEvent(
    actingUser,
    'EMPLOYEE_CREATED',
    'Employee',
    employee.id,
    `נוצר עובד חדש: ${employee.firstName} ${employee.lastName}${
      createdAsManager ? ' (אושר לדיווח נוכחות מיידי על ידי המנהל הישיר)' : ''
    }`,
  );

  return employee;
}

/** The site/unit manager approves a pending employee for attendance reporting,
 * independent of the HR/Payroll onboarding track. */
export async function approveEmployeeForAttendance(
  employeeId: string,
  attendanceMethod: AttendanceMethod,
  actingUser: User,
): Promise<Employee> {
  const updated = await employeeRepository.update(employeeId, {
    attendanceSystemStatus: SystemLinkStatus.ACTIVE,
    attendanceMethod,
    updatedAt: nowIso(),
  });

  const request = await onboardingRepository.getByEmployeeId(employeeId);
  if (request) {
    await onboardingRepository.addStep({
      id: newId(),
      onboardingRequestId: request.id,
      step: OnboardingStepStatus.ATTENDANCE_ACTIVATED,
      completedAt: nowIso(),
      completedBy: actingUser.id,
      notes: 'אושר לדיווח נוכחות על ידי המנהל הישיר',
    });
  }

  await logEvent(
    actingUser,
    'ATTENDANCE_ACTIVATED',
    'Employee',
    employeeId,
    'המנהל הישיר אישר את העובד לדיווח נוכחות',
  );

  return updated;
}

const HR_STEP_ORDER = [
  OnboardingStepStatus.HR_REVIEW,
  OnboardingStepStatus.MISSING_DOCUMENTS,
  OnboardingStepStatus.DOCUMENTS_COMPLETE,
] as const;

/** Advances the HR onboarding track (documents / review), independent of the
 * attendance and payroll tracks. TODO - confirm exact real workflow with HR. */
export async function advanceHrOnboardingStep(
  employeeId: string,
  step: (typeof HR_STEP_ORDER)[number],
  actingUser: User,
  notes?: string,
): Promise<Employee> {
  const request = await onboardingRepository.getByEmployeeId(employeeId);
  if (!request) throw new Error('לא נמצא תהליך קליטה עבור עובד זה');

  await onboardingRepository.addStep({
    id: newId(),
    onboardingRequestId: request.id,
    step,
    completedAt: nowIso(),
    completedBy: actingUser.id,
    notes: notes ?? null,
  });
  await onboardingRepository.update(request.id, { currentStep: step, updatedAt: nowIso() });

  const hrSystemStatus =
    step === OnboardingStepStatus.DOCUMENTS_COMPLETE ? SystemLinkStatus.ACTIVE : SystemLinkStatus.PENDING;
  await employeeRepository.update(employeeId, { hrSystemStatus, updatedAt: nowIso() });

  await logEvent(actingUser, 'ONBOARDING_STEP_CHANGED', 'Employee', employeeId, `שלב קליטה עודכן: ${step}`);

  return maybeActivateEmployee(employeeId, actingUser);
}

/** Advances the Payroll onboarding track. */
export async function advancePayrollSetup(employeeId: string, actingUser: User): Promise<Employee> {
  await employeeRepository.update(employeeId, {
    payrollSystemStatus: SystemLinkStatus.ACTIVE,
    updatedAt: nowIso(),
  });

  const request = await onboardingRepository.getByEmployeeId(employeeId);
  if (request) {
    await onboardingRepository.addStep({
      id: newId(),
      onboardingRequestId: request.id,
      step: OnboardingStepStatus.PAYROLL_SETUP,
      completedAt: nowIso(),
      completedBy: actingUser.id,
      notes: null,
    });
    await onboardingRepository.update(request.id, {
      currentStep: OnboardingStepStatus.PAYROLL_SETUP,
      updatedAt: nowIso(),
    });
  }

  await logEvent(actingUser, 'PAYROLL_SETUP_COMPLETE', 'Employee', employeeId, 'קליטה לשכר הושלמה');

  return maybeActivateEmployee(employeeId, actingUser);
}

/** Once all three tracks (HR, Payroll, Attendance) are ACTIVE, the employee is
 * fully activated. This is a prototype business rule, not a confirmed real one. */
async function maybeActivateEmployee(employeeId: string, actingUser: User): Promise<Employee> {
  const employee = await employeeRepository.getById(employeeId);
  if (!employee) throw new Error('עובד לא נמצא');

  const allActive =
    employee.hrSystemStatus === SystemLinkStatus.ACTIVE &&
    employee.payrollSystemStatus === SystemLinkStatus.ACTIVE &&
    employee.attendanceSystemStatus === SystemLinkStatus.ACTIVE;

  if (allActive && employee.status === EmployeeStatus.PENDING) {
    const updated = await employeeRepository.update(employeeId, {
      status: EmployeeStatus.ACTIVE,
      updatedAt: nowIso(),
    });
    const request = await onboardingRepository.getByEmployeeId(employeeId);
    if (request) {
      await onboardingRepository.update(request.id, {
        currentStep: OnboardingStepStatus.ACTIVE,
        updatedAt: nowIso(),
      });
    }
    await logEvent(actingUser, 'EMPLOYEE_ACTIVATED', 'Employee', employeeId, 'הקליטה הושלמה - העובד פעיל במלואו');
    return updated;
  }

  return employee;
}

export async function updateEmployeeStatus(
  employeeId: string,
  status: EmployeeStatus,
  actingUser: User,
): Promise<Employee> {
  const updated = await employeeRepository.update(employeeId, { status, updatedAt: nowIso() });
  await logEvent(actingUser, 'EMPLOYEE_STATUS_CHANGED', 'Employee', employeeId, `סטטוס עודכן ל: ${status}`);
  return updated;
}

export async function updateEmployeeDetails(
  employeeId: string,
  patch: Partial<Employee>,
  actingUser: User,
): Promise<Employee> {
  const updated = await employeeRepository.update(employeeId, { ...patch, updatedAt: nowIso() });
  await logEvent(actingUser, 'EMPLOYEE_UPDATED', 'Employee', employeeId, 'פרטי עובד עודכנו');
  return updated;
}
