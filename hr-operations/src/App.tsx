import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { RequireAuth } from './router/RequireAuth';
import { RequireDataConnection } from './router/RequireDataConnection';
import { RequirePermission } from './router/RequirePermission';
import { RootRedirect } from './router/RootRedirect';
import { LoginPage } from './pages/LoginPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
import { ManagerDashboardPage } from './pages/ManagerDashboardPage';
import { EmployeesListPage } from './pages/EmployeesListPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { NewEmployeePage } from './pages/NewEmployeePage';
import { PendingEmployeesPage } from './pages/PendingEmployeesPage';
import { AttendancePage } from './pages/AttendancePage';
import { ExceptionsPage } from './pages/ExceptionsPage';
import { OrganizationPage } from './pages/OrganizationPage';
import { ImportExportPage } from './pages/ImportExportPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { ReportsPage } from './pages/ReportsPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import {
  canCreateEmployee,
  canImportExport,
  canViewAuditLog,
  canViewDashboard,
  canViewManagerDashboard,
  canViewOrgStructure,
} from './permissions/policies';
import { UserRole } from './types/enums';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/login"
          element={
            <RequireDataConnection>
              <LoginPage />
            </RequireDataConnection>
          }
        />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route
            path="/dashboard"
            element={
              <RequirePermission check={canViewDashboard}>
                <DashboardPage />
              </RequirePermission>
            }
          />
          <Route
            path="/manager/dashboard"
            element={
              <RequirePermission check={canViewManagerDashboard}>
                <ManagerDashboardPage />
              </RequirePermission>
            }
          />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route
            path="/employees"
            element={
              <RequirePermission check={(u) => u.role !== UserRole.EMPLOYEE}>
                <EmployeesListPage />
              </RequirePermission>
            }
          />
          <Route
            path="/employees/new"
            element={
              <RequirePermission check={canCreateEmployee}>
                <NewEmployeePage />
              </RequirePermission>
            }
          />
          <Route
            path="/employees/pending"
            element={
              <RequirePermission check={(u) => u.role !== UserRole.EMPLOYEE}>
                <PendingEmployeesPage />
              </RequirePermission>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <RequirePermission check={() => true}>
                <EmployeeProfilePage />
              </RequirePermission>
            }
          />
          <Route
            path="/exceptions"
            element={
              <RequirePermission check={(u) => u.role !== UserRole.EMPLOYEE}>
                <ExceptionsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/organization"
            element={
              <RequirePermission check={canViewOrgStructure}>
                <OrganizationPage />
              </RequirePermission>
            }
          />
          <Route
            path="/import-export"
            element={
              <RequirePermission check={canImportExport}>
                <ImportExportPage />
              </RequirePermission>
            }
          />
          <Route
            path="/audit"
            element={
              <RequirePermission check={canViewAuditLog}>
                <AuditLogPage />
              </RequirePermission>
            }
          />
          <Route
            path="/reports"
            element={
              <RequirePermission check={(u) => u.role !== UserRole.EMPLOYEE}>
                <ReportsPage />
              </RequirePermission>
            }
          />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
