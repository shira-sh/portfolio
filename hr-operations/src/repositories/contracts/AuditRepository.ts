import type { AuditEvent } from '../../types/entities';

export interface AuditRepository {
  getAll(): Promise<AuditEvent[]>;
  getByEntity(entityType: string, entityId: string): Promise<AuditEvent[]>;
  append(event: AuditEvent): Promise<AuditEvent>;
}
