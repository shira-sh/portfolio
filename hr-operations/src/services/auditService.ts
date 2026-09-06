import { auditRepository } from '../repositories';
import type { AuditEvent, User } from '../types/entities';
import { newId } from '../utils/id';
import { nowIso } from '../utils/dateFormat';

export async function logEvent(
  user: User,
  action: string,
  entityType: string,
  entityId: string,
  details: string,
): Promise<AuditEvent> {
  const event: AuditEvent = {
    id: newId(),
    timestamp: nowIso(),
    userId: user.id,
    userDisplayName: user.displayName,
    action,
    entityType,
    entityId,
    details,
  };
  return auditRepository.append(event);
}

export async function getAllEvents(): Promise<AuditEvent[]> {
  return auditRepository.getAll();
}

export async function getEventsForEntity(entityType: string, entityId: string): Promise<AuditEvent[]> {
  return auditRepository.getByEntity(entityType, entityId);
}
