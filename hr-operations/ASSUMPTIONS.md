# Assumptions

Organized per spec section 56: KNOWN / ASSUMED / UNKNOWN. This is a living document - update it
as real answers replace assumptions.

## KNOWN (confirmed by the stakeholder)

- Employees can belong to more than one department/unit/manager, even though it's uncommon today -
  the data model must support this natively, not as a future add-on.
- `nationalId` (תעודת זהות) is the organization's real unique identifier for a person.
- The direct manager of a work site (e.g. a regional manager over a group of after-school programs)
  is the one who actually creates a new employee record and approves them to start working.
- That manager approval alone is enough to let the employee report attendance immediately - it does
  not wait for HR or Payroll onboarding to finish.
- The full onboarding process (in reality) is: HR enters the employee into the system → the
  employee submits and signs documents → HR approves the onboarding → the record moves to Payroll
  for salary setup.
- The organization sometimes needs an employee to start working with no time for the full
  onboarding process, and the system must not block attendance reporting in that case.
- The Excel files considered authoritative today live with HR and with the Payroll/accounting
  function ("חשבות שכר").
- The organization has several distinct departments (HR, Finance, Community, Complementary
  Education, Swimming Pools, Theaters, Digital, Headquarters), each with multiple units/sites.

## ASSUMED (reasonable prototype defaults - not yet confirmed)

- `EmploymentType` is one of `FULL_TIME / PART_TIME / HOURLY / CONTRACTOR`. The organization's real
  employment-type taxonomy has not been confirmed.
- Once `hrSystemStatus`, `payrollSystemStatus`, and `attendanceSystemStatus` are all `ACTIVE`, the
  employee's overall status automatically flips from `PENDING` to `ACTIVE`. This is a prototype
  convenience rule, not a confirmed business rule.
- The onboarding step vocabulary (`REQUESTED, HR_REVIEW, MISSING_DOCUMENTS, DOCUMENTS_COMPLETE,
  PAYROLL_SETUP, ATTENDANCE_ACTIVATED, ACTIVE`) is a reasonable prototype approximation of the real
  process, not the organization's actual formal workflow.
- A Manager's scope ("my employees") is derived from being listed as `managerId` on an employee's
  assignment(s), rather than from a department-based scope list. An HR Referent's scope, by
  contrast, is a list of department IDs (`scopeDepartmentIds`). These may not match how scope is
  actually assigned in the organization.
- Attendance exception approval authority defaults to: the direct manager first, escalating to HR
  Referent/HR Manager. The real approval chain per department/exception type is unconfirmed.
- Attendance sources are limited to `APP / PHONE / CLOCK / MANUAL / TEMP_EMPLOYEE`; the organization
  may use additional or different channels in practice.
- Payroll users (`PAYROLL` role) can view all employees' payroll-relevant status, not scoped to a
  department - the real scoping rules for the payroll function are unconfirmed.
- Demo/seed data uses entirely fictional Israeli names and synthetic 9-digit "national ID" numbers
  that are not validated against Israel's real ID checksum algorithm - they are placeholders only.

## UNKNOWN (needs discovery - see DISCOVERY_QUESTIONS.md)

- Whether an employee can formally report to more than one manager, and how conflicts between
  multiple managers' decisions about the same employee would be resolved.
- The organization's real, formal onboarding workflow and who owns each transition.
- The exact attendance channels in active use today across different departments/sites.
- Whether there is a secondary confirmation step after a manager creates+approves a new employee,
  before attendance reporting is enabled, or whether it is genuinely a single-step action.
- How multi-department assignment is actually tracked today (if at all) in the current
  Excel/HR-system reality, so the prototype's `EmployeeAssignment` model can be reconciled with it.
