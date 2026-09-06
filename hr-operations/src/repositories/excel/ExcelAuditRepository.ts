import type { AuditRepository } from '../contracts/AuditRepository';
import type { AuditEvent } from '../../types/entities';
import { getDatabase, touch } from '../../excel/dbState';

export class ExcelAuditRepository implements AuditRepository {
  async getAll(): Promise<AuditEvent[]> {
    return [...getDatabase().auditLog].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async getByEntity(entityType: string, entityId: string): Promise<AuditEvent[]> {
    return getDatabase()
      .auditLog.filter((e) => e.entityType === entityType && e.entityId === entityId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  async append(event: AuditEvent): Promise<AuditEvent> {
    getDatabase().auditLog.push(event);
    await touch();
    return event;
  }
}
