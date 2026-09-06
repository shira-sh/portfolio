import type { AuditEvent } from '../../types/entities';
import { str } from '../mapperUtils';

export function rowToAuditEvent(row: Record<string, unknown>): AuditEvent {
  return {
    id: str(row.id),
    timestamp: str(row.timestamp),
    userId: str(row.userId),
    userDisplayName: str(row.userDisplayName),
    action: str(row.action),
    entityType: str(row.entityType),
    entityId: str(row.entityId),
    details: str(row.details),
  };
}

export function auditEventToRow(event: AuditEvent): Record<string, unknown> {
  return { ...event };
}
