import { Breadcrumbs } from '../components/Breadcrumbs';
import { DataTable, type DataTableColumn } from '../components/DataTable';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { useAuditLog } from '../hooks/useAuditLog';
import type { AuditEvent } from '../types/entities';
import { formatDateTimeIL } from '../utils/dateFormat';

const columns: DataTableColumn<AuditEvent>[] = [
  { key: 'timestamp', header: 'תאריך ושעה', render: (e) => formatDateTimeIL(e.timestamp), sortValue: (e) => e.timestamp },
  { key: 'action', header: 'פעולה', render: (e) => e.action },
  { key: 'entityType', header: 'סוג ישות', render: (e) => e.entityType },
  { key: 'details', header: 'פרטים', render: (e) => e.details },
  { key: 'user', header: 'בוצע על ידי', render: (e) => e.userDisplayName },
];

export function AuditLogPage() {
  const { events, isLoading } = useAuditLog();

  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: 'דשבורד', to: '/dashboard' }, { label: 'יומן פעילות' }]} />
      <h1 className="text-xl font-bold text-gray-900">יומן פעילות ({events.length})</h1>

      {isLoading ? (
        <LoadingState />
      ) : events.length === 0 ? (
        <EmptyState message="עדיין לא נרשמו אירועים במערכת" />
      ) : (
        <DataTable columns={columns} rows={events} rowKey={(e) => e.id} pageSize={30} />
      )}
    </div>
  );
}
