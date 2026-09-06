# Discovery Questions

Open questions for the business, organized by area. Answered items are marked ✅ with a short
pointer to where the answer is captured; everything else is still open.

## Organizational Structure

- ✅ Can an employee belong to more than one department? **Yes** - see ASSUMPTIONS.md (KNOWN).
- ✅ Can an employee work at multiple sites? **Yes**, same answer as above.
- Can an employee formally report to more than one manager? If so, how are conflicting
  instructions/approvals from different managers resolved?
- Is the Department → Unit hierarchy always exactly two levels, or can units contain sub-units, or
  departments contain sub-departments?
- Are there organizational roles/units not covered by the eight departments described (HR, Finance,
  Community, Complementary Education, Swimming Pools, Theaters, Digital, Headquarters)?

## Employees / Identity

- ✅ What uniquely identifies an employee? **Teudat Zehut (national ID)**.
- Are there employees without a valid Israeli teudat zehut (e.g. foreign workers, minors) who need
  a different identifier?
- What employment types actually exist in the organization's payroll/HR systems today?

## HR

- ✅ Who creates a new employee? **The direct manager of the work site**, for the purpose of
  starting work; HR separately owns the formal onboarding record.
- What is the HR system's real workflow once a manager has already created an employee and enabled
  attendance? Who is notified, and within what timeframe is HR expected to act?
- Who approves onboarding completion in the real HR system, and what evidence/documents are
  actually required before that approval?
- Is there a case where HR (not a site manager) is the one creating a new employee record? How does
  that flow differ?

## Payroll

- ✅ When is an employee created in the HR system vs. activated in the attendance system?
  **Attendance can be activated first, independently, by the site manager; HR/Payroll onboarding
  happens afterward** - see ASSUMPTIONS.md.
- What information does Payroll need before an employee can be "set up" for salary, beyond what
  this prototype currently models (bank details, tax forms, etc. - out of scope for this
  prototype, but relevant to know for a real integration)?
- Does Payroll ever block or reverse attendance activation (e.g. if documents are never completed)?

## Attendance

- What attendance channels actually exist in the organization today (mobile app, phone-based
  clock-in, physical clock/terminal, manual HR entry, other)? Are they the same across all
  departments/sites?
- Who approves attendance exceptions in practice - always the direct manager, or does it vary by
  exception type or department?
- Is there a cutoff period after which unapproved/uncorrected attendance records are locked (e.g.
  for a payroll cycle)?

## Managers

- Do managers currently have any system today to view "their" employees, or is this entirely
  manual/informal?
- What is a manager legally/organizationally allowed to approve without HR sign-off (e.g. can they
  alone approve a manual attendance correction)?

## Employees

- Do employees currently have any self-service tool for viewing their own attendance/status, or is
  this a new capability being introduced by this project?

## IT / Existing Systems

- What is the name and nature of the current HR system, attendance system, and payroll system
  (on-prem, SaaS, custom)? Do any expose an API this project could eventually integrate with?
- Is single sign-on (SSO) available or planned, for when real authentication replaces the demo
  login?

## Security

- What data classification applies to fields like national ID, phone, and salary-related status -
  are there specific handling/retention requirements to design for in a production version?
- Who should be allowed to see audit log entries, and are there entries that must never be visible
  even to HR Managers (e.g. actions by System Admins)?

## Excel Files / Data Ownership

- ✅ Which Excel files are considered authoritative today, and who owns them? **Files held by HR and
  by Payroll/accounting ("חשבות שכר")** - see ASSUMPTIONS.md. Which specific files, and for which
  data domains exactly (e.g. is there one file per department, or one central file)?
- How often are these files updated, and by whom? Is there any existing reconciliation process
  when the same employee appears differently in different files?
- Are there other Excel files currently in active use (e.g. by individual HR coordinators) that
  aren't yet accounted for in this prototype's scope?
