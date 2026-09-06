# HR Operations Hub — Architecture Document

**Status:** Prototype - implemented (see "Implementation Status" below)
**Audience:** Engineering
**Related docs:** ASSUMPTIONS.md, DISCOVERY_QUESTIONS.md, README.md

---

## 1. Purpose & Product Framing

This application is an **Employee Operations Hub**, not an attendance app. Attendance is one module
inside a broader operational layer that unifies employee identity, organizational assignment,
onboarding status, and HR/Payroll system status — today fragmented across multiple systems and
Excel files.

The prototype is a **local-first React application** backed by a single Excel workbook
(`HR_DEMO.xlsx`) as the data store, built so that the Excel layer can later be swapped for a real
REST API + database **without rewriting the UI**.

---

## 2. Technology Stack

| Concern | Choice |
|---|---|
| UI | React + TypeScript (strict mode) |
| Styling | Tailwind CSS v4 |
| Routing | React Router |
| State | Zustand (global) + local component/hook state (feature data) |
| Forms | React Hook Form + Zod |
| Excel I/O | SheetJS (xlsx) + File System Access API, with upload/download fallback |
| Icons | Lucide |

No backend, no database server, no real authentication. Redux is intentionally not used — the
state surface (auth/session, data-source connection status, light caches) does not justify it.

---

## 3. Layered Architecture

```
UI (pages / feature components)
      |
Feature hooks (useEmployees, useAttendance, ...)
      |
Service Layer     employeeService, attendanceService, onboardingService, departmentService,
                   authService, auditService
      |  (depends on interfaces, not implementations)
Repository Interfaces
      EmployeeRepository, EmployeeAssignmentRepository, AttendanceRepository,
      AttendanceExceptionRepository, DepartmentRepository, UnitRepository,
      OnboardingRepository, UserRepository, AuditRepository
      |
Excel Repository Implementations
      ExcelEmployeeRepository, ExcelAttendanceRepository, ...
      |
Excel Mapper Layer (row <-> entity, per sheet)
      |
Excel Adapter (workbook load/save via SheetJS)
      |
HR_DEMO.xlsx
```

**Rule:** UI components never import SheetJS, never see raw sheet rows, never know whether data
comes from Excel or (in the future) an API. All business rules (validation, status transitions,
audit-event creation) live in the **Service Layer**, not in components and not in the Excel layer.

Future migration path: implement `ApiEmployeeRepository`, `ApiAttendanceRepository`, etc. against
the same repository interfaces, and swap the implementation registered in a single composition
root (`src/repositories/index.ts`). Services and UI do not change.

The in-memory `Database` object (`src/types/database.ts`) held by `src/excel/dbState.ts` is the
single source of truth while the app runs; repositories read/write it directly and every mutation
triggers `touch()`, which auto-persists to the connected file when a writable handle exists.

---

## 4. Entity Model

### 4.1 Identity strategy (clarified with stakeholder)

- **Business identifier:** `nationalId` (ID number) is the organization's real-world unique
  identifier for a person - the field HR and Payroll use to recognize an employee across systems.
  It is enforced unique at the service/validation layer (`employeeService.createPendingEmployee`)
  and checked during Excel import validation.
- **Technical identifier:** every entity still carries an internal stable `id` (UUID), used for all
  foreign keys and React keys, per the "never use array index or a mutable business field as the
  primary key" rule. `nationalId` can theoretically be corrected (typo fix) without breaking
  referential integrity, because relations point at `id`, not at `nationalId`.

### 4.2 Multi-assignment is a first-class feature (clarified)

The stakeholder confirmed that although uncommon today, an employee **must** be able to belong to
more than one department/unit/manager. `EmployeeAssignment` is therefore the actual source of truth
for organizational placement, not a future-proofing placeholder:

- `Employee.primaryDepartmentId / primaryUnitId / primaryManagerId` remain on the employee record
  as **denormalized convenience fields** for fast table rendering, kept in sync with the assignment
  flagged `isPrimary: true`.
- The **"שיוכים ארגוניים" (Assignments) tab** on the employee profile lists all `EmployeeAssignment`
  rows for that employee. The seed data intentionally gives a handful of employees a second
  assignment to demonstrate this.
- Permission scoping (`src/permissions/policies.ts`) is evaluated against **all** of the employee's
  assignments, not just the primary one (see `isManagerOf` / `isInHrScope`).

### 4.3 Onboarding & attendance activation (clarified)

Stakeholder description of the real process:

> HR enters an employee into the system; the employee submits and signs documents; HR approves the
> onboarding; the record then moves to Payroll for salary setup. However, sometimes an employee is
> needed immediately and there isn't time for the full process — that employee should still be able
> to log in and report attendance.
>
> In practice, the **direct manager of the work site** (e.g. a regional manager over a group of
> after-school programs) is the one who actually creates the employee record and approves it for
> work. That approval alone should immediately allow attendance reporting. The full HR onboarding
> steps are then completed later by the HR referent.

This means onboarding is **not one linear pipeline** — it is two tracks that start independently:

| Track | Owner | Trigger | Result |
|---|---|---|---|
| Attendance activation | Site/unit Manager | Manager creates & approves the employee (`employeeService.createPendingEmployee` / `approveEmployeeForAttendance`) | `attendanceSystemStatus = ACTIVE`, employee can clock in/out immediately, even while `status = PENDING` |
| HR + Payroll onboarding | HR Referent → Payroll | `advanceHrOnboardingStep` / `advancePayrollSetup` | `hrSystemStatus` and `payrollSystemStatus` progress through review → documents → payroll setup |

The three independent status fields on `Employee` (`hrSystemStatus`, `payrollSystemStatus`,
`attendanceSystemStatus`) model this directly. Once all three reach `ACTIVE`,
`employeeService` automatically flips the employee's overall `status` from `PENDING` to `ACTIVE`
(`maybeActivateEmployee`) - a prototype business rule, not a confirmed real one.

`OnboardingRequest` / `OnboardingStep` remain as a **timeline log** (who did what, when), shown on
the profile's "קליטה" tab, but the employee's real-time state is always read from the three status
fields. The step vocabulary (`REQUESTED, HR_REVIEW, MISSING_DOCUMENTS, DOCUMENTS_COMPLETE,
PAYROLL_SETUP, ATTENDANCE_ACTIVATED, ACTIVE`) is a display/timeline vocabulary only.
**TODO — confirm the organization's exact formal onboarding workflow.**

### 4.4 Core Types

See `src/types/entities.ts` and `src/types/enums.ts` for the authoritative definitions. Summary:

```typescript
type EmployeeStatus = 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'TERMINATED';
type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'HOURLY' | 'CONTRACTOR'; // ASSUMPTION
type SystemLinkStatus = 'NOT_STARTED' | 'PENDING' | 'ACTIVE' | 'ERROR';
type AttendanceMethod = 'APP' | 'PHONE' | 'CLOCK' | 'MANUAL' | 'NONE';

interface Employee {
  id: string;                 // UUID - internal stable key
  nationalId: string;         // business unique identifier (demo/fake values only)
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  status: EmployeeStatus;
  employmentType: EmploymentType;
  roleTitle: string;
  primaryDepartmentId: string; // denormalized from primary EmployeeAssignment
  primaryUnitId: string;
  primaryManagerId: string | null;
  startDate: string;           // ISO date
  endDate: string | null;
  attendanceMethod: AttendanceMethod;
  hrSystemStatus: SystemLinkStatus;
  payrollSystemStatus: SystemLinkStatus;
  attendanceSystemStatus: SystemLinkStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeAssignment {
  id: string; employeeId: string; departmentId: string; unitId: string;
  managerId: string | null; roleTitle: string; isPrimary: boolean;
  startDate: string; endDate: string | null;
}

interface Department { id: string; name: string; code: string; parentDepartmentId: string | null; isActive: boolean; }
interface Unit { id: string; departmentId: string; name: string; code: string; address: string | null; isActive: boolean; }

type UserRole = 'EMPLOYEE' | 'MANAGER' | 'HR_REFERENT' | 'PAYROLL' | 'HR_MANAGER' | 'SYSTEM_ADMIN';

interface User {
  id: string; employeeId: string | null; displayName: string; role: UserRole;
  scopeDepartmentIds: string[]; isActive: boolean;
}

type AttendanceStatus = 'OK' | 'MISSING_IN' | 'MISSING_OUT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
type AttendanceSource = 'APP' | 'PHONE' | 'CLOCK' | 'MANUAL' | 'TEMP_EMPLOYEE';

interface AttendanceRecord {
  id: string; employeeId: string; date: string;
  clockIn: string | null; clockOut: string | null; workedMinutes: number | null;
  status: AttendanceStatus; source: AttendanceSource; unitId: string;
  createdAt: string; updatedAt: string;
}

type ExceptionType = 'MISSING_IN' | 'MISSING_OUT' | 'MANUAL_CORRECTION' | 'LATE_ENTRY' | 'OVERLAPPING' | 'MANAGER_APPROVAL_REQUIRED';
type ExceptionStatus = 'OPEN' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

interface AttendanceException {
  id: string; employeeId: string; attendanceRecordId: string | null;
  type: ExceptionType; status: ExceptionStatus; requestedChange: string | null;
  createdAt: string; resolvedAt: string | null; resolvedBy: string | null;
}

type OnboardingStepStatus = 'REQUESTED' | 'HR_REVIEW' | 'MISSING_DOCUMENTS' | 'DOCUMENTS_COMPLETE'
  | 'PAYROLL_SETUP' | 'ATTENDANCE_ACTIVATED' | 'ACTIVE'; // TODO - confirm real workflow

interface OnboardingRequest { id: string; employeeId: string; currentStep: OnboardingStepStatus; createdAt: string; updatedAt: string; createdBy: string; }
interface OnboardingStep { id: string; onboardingRequestId: string; step: OnboardingStepStatus; completedAt: string | null; completedBy: string | null; notes: string | null; }
interface AuditEvent { id: string; timestamp: string; userId: string; userDisplayName: string; action: string; entityType: string; entityId: string; details: string; }
interface SystemStatus { totalEmployees: number; pendingEmployees: number; attendanceExceptions: number; pendingApprovals: number; }
interface FileConnectionStatus { fileName: string | null; isConnected: boolean; lastLoadedAt: string | null; rowCounts: Record<string, number>; canWriteDirectly: boolean; }
```

---

## 5. Excel Workbook Schema (`HR_DEMO.xlsx`)

| Sheet | Key columns |
|---|---|
| Employees | id, nationalId, firstName, lastName, phone, email, status, employmentType, roleTitle, primaryDepartmentId, primaryUnitId, primaryManagerId, startDate, endDate, attendanceMethod, hrSystemStatus, payrollSystemStatus, attendanceSystemStatus, notes, createdAt, updatedAt |
| EmployeeAssignments | id, employeeId, departmentId, unitId, managerId, roleTitle, isPrimary, startDate, endDate |
| Departments | id, name, code, parentDepartmentId, isActive |
| Units | id, departmentId, name, code, address, isActive |
| Attendance | id, employeeId, date, clockIn, clockOut, workedMinutes, status, source, unitId, createdAt, updatedAt |
| AttendanceExceptions | id, employeeId, attendanceRecordId, type, status, requestedChange, createdAt, resolvedAt, resolvedBy |
| Onboarding | id, employeeId, currentStep, createdAt, updatedAt, createdBy |
| OnboardingSteps | id, onboardingRequestId, step, completedAt, completedBy, notes |
| Users | id, employeeId, displayName, role, scopeDepartmentIds (comma-separated), isActive |
| AuditLog | id, timestamp, userId, userDisplayName, action, entityType, entityId, details |

Dates are stored as ISO strings (`YYYY-MM-DD`) inside the workbook and formatted to Israeli
notation (`DD/MM/YYYY`) only at the UI layer (`src/utils/dateFormat.ts`).

Each sheet maps 1:1 to an entity through a dedicated mapper under `src/excel/mappers/`
(`employeeExcelMapper.ts`, `attendanceExcelMapper.ts`, ...). Raw column names never leak past the
mapper - `src/excel/workbookAdapter.ts` is the only place SheetJS is imported.

---

## 6. Permission Model

Implemented as pure policy functions in `src/permissions/policies.ts`, not scattered role checks:

```typescript
canViewEmployee(user, employee, assignments): boolean
canEditEmployee(user, employee, assignments): boolean
canViewAttendance(user, employee, assignments): boolean
canReportOwnAttendance(user, employee): boolean
canApproveAttendanceExceptions(user, employee, assignments): boolean
canManageUsers(user): boolean
canViewPayrollStatus(user): boolean
canCreateEmployee(user): boolean
canApproveNewEmployeeForAttendance(user, employee, assignments): boolean  // site/unit manager action
canUpdateOnboardingStatus(user, employee, assignments): boolean          // HR referent / payroll action
canViewOrgStructure(user): boolean
canImportExport(user): boolean
canViewAuditLog(user): boolean
canViewDashboard(user): boolean
canViewManagerDashboard(user): boolean
```

Scoping for Manager and HR Referent is evaluated against **all** of an employee's
`EmployeeAssignment` rows (not just the primary one), matching the multi-department decision above.

| Action | Employee | Manager | HR Referent | Payroll | HR Manager | Admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| View own profile | Yes | Yes | Yes | Yes | Yes | Yes |
| View employees | No | Own site(s) only | Own scope | All (limited fields in UI) | All | All |
| Create employee (site-level, activates attendance) | No | Yes | Yes | No | Yes | Yes |
| Edit employee record | No | No | Yes (scope) | No | Yes | Yes |
| Report own attendance | Yes | Yes | Yes | No | No | No |
| Approve attendance exceptions | No | Yes (own reports) | Yes | No | Yes | Yes |
| Advance HR/Payroll onboarding | No | No | Yes | Yes | Yes | Yes |
| Manage users & permissions | No | No | No | No | No | Yes |
| Import / export Excel | No | No | Yes | No | Yes | Yes |
| View audit log | No | No | No | No | Yes | Yes |

---

## 7. Route Map

```
/settings                     Data file connection (always reachable, no auth required)
/login                         Demo login (requires a connected data file)
/dashboard                     HR dashboard (HR Referent / HR Manager / System Admin)
/manager/dashboard              Manager dashboard
/attendance                     Personal attendance screen (Employee / Manager, mobile-first)
/employees                      Employee list (filterable via query params)
/employees/new                  New / pending employee form
/employees/pending               Pending employees queue
/employees/:id                   Employee profile (tabs: overview, attendance, assignments, onboarding, documents, activity)
/exceptions                      Attendance exceptions
/organization                    Org structure (departments, units)
/import-export                    Excel import / export
/audit                             Audit log
/reports                           Summary reports
/unauthorized
```

Sidebar items (`src/config/navigation.ts`) are filtered per role; every protected route is wrapped
by `RequireAuth` (`src/router/RequireAuth.tsx`) and, where relevant, `RequirePermission`
(`src/router/RequirePermission.tsx`) which checks the matching policy function.

---

## 8. Project Structure (as implemented)

```
src/
  layouts/           AppLayout, Sidebar, Header
  router/            RequireAuth, RequireDataConnection, RequirePermission, RootRedirect
  pages/             one file per screen (thin, composed from hooks + components)
  services/          employeeService, attendanceService, onboardingService,
                      departmentService, authService, auditService
  repositories/
    contracts/       repository interfaces
    excel/           Excel*Repository implementations
    index.ts         composition root (interface -> implementation bindings)
  excel/
    workbookAdapter.ts   SheetJS read/write - the only file that imports `xlsx`
    dbState.ts           in-memory Database + file handle + auto-persist
    fileConnection.ts    File System Access API + upload/download fallback
    mappers/             row <-> entity per sheet
    validators/          import validation (importValidator.ts)
  permissions/       policies.ts - all access-control decisions
  types/             entities.ts, enums.ts, database.ts, fileSystemAccess.d.ts
  stores/            authStore, dataSourceStore (Zustand)
  hooks/             useEmployees, useAttendance, useDepartments, useAuditLog, ...
  components/        DataTable, StatusBadge, KpiCard, Card, Drawer, EmptyState, ...
  utils/             dateFormat.ts, id.ts
  config/            labels.ts, badgeColors.ts, navigation.ts (Hebrew label maps)
  seed/              generateSeedData.ts, fakeNames.ts
scripts/
  generateSeed.ts    Node script: `npm run seed` -> writes seed-data/HR_DEMO.xlsx
public/seed/HR_DEMO.xlsx   demo workbook, downloadable from the Settings screen
```

---

## 9. State Management

- **Zustand** stores: `authStore` (current demo user/role), `dataSourceStore` (Excel connection
  status: file handle/name, last load/save time, row counts, write capability, loading/error state).
  `dataSourceStore` subscribes to `excel/dbState.ts`'s change events so it always reflects the true
  in-memory data state.
- **Feature-level hooks** (`useEmployees`, `useAttendance`, ...) own their own data + loading/error
  state, calling into the Service Layer — no global cache library (e.g. React Query) is justified
  for a local, synchronous data source.
- All cross-cutting business state (status transitions, validation, audit logging) is computed in
  services, never in Zustand stores or components.

---

## 10. Future API Migration

The only planned migration is:

```
React -> Services -> Repositories -> Excel         (today)
React -> Services -> Repositories -> REST API -> Node.js -> PostgreSQL   (future)
```

Because Services depend only on Repository **interfaces** (`src/repositories/contracts/`),
migrating means:
1. Implement `ApiEmployeeRepository` etc. against the same interfaces.
2. Swap the bindings in the composition root (`src/repositories/index.ts`).
3. No changes required in Services, hooks, or UI components.

Excel is explicitly treated as a **prototype data store**, not a future production database.

---

## 11. Primary Demo Scenario (verified working)

1. Connect `HR_DEMO.xlsx` via Settings (or the downloadable seed file).
2. Log in as **HR Referent** - dashboard shows KPIs (active/pending employees, attendance
   exceptions, pending approvals, employees by department, etc.), each card links to a filtered
   employees/exceptions list.
3. Open **קליטת עובדים** (Pending Employees queue) → open one employee.
4. Their header shows: employee status "ממתין לקליטה", **נוכחות: פעיל** (attendance active),
   **HR: ממתין** (pending), **שכר: טרם החל** (not started) - exactly the "already working, not
   fully onboarded" scenario.
5. Their "נוכחות" tab already shows attendance records.
6. On the "קליטה" tab, advance the HR onboarding step (e.g. "מסמכים הושלמו") - this updates
   `hrSystemStatus`, appends an `OnboardingStep`, and calls `auditService.logEvent`.
7. The change is written back to the connected Excel file automatically (or via manual
   Save/Export when direct write isn't available), and appears in the "פעילות" (Activity) tab and
   in the global Audit Log.

This flow was exercised end-to-end in a real Chromium browser during development (data connection,
role switching, dashboard, employee list/profile, pending-employee onboarding actions, and the
personal attendance clock-in/out flow) with no console errors.

---

## 12. Open Items (not yet resolved with the business)

- Exact real-world attendance channels in use today, and the precise approval chain for attendance
  exceptions per department (currently modeled generically: direct manager, then HR Referent/HR
  Manager as escalation).
- The organization's formal (non-prototype) onboarding workflow steps and the exact HR→Payroll
  handoff.
- Whether a manager's employee-creation action needs a secondary confirmation before attendance is
  enabled, or is a single-step approval as currently modeled.

These remain tracked in `ASSUMPTIONS.md` and `DISCOVERY_QUESTIONS.md` and do not block prototype
development — reasonable defaults are documented and easily adjustable.
