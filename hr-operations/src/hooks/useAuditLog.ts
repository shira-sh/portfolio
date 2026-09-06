import { useCallback, useEffect, useState } from 'react';
import type { AuditEvent } from '../types/entities';
import { getAllEvents, getEventsForEntity } from '../services/auditService';

export function useAuditLog() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setEvents(await getAllEvents());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, isLoading, refetch };
}

export function useEntityAuditLog(entityType: string, entityId: string | null) {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    if (!entityId) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setEvents(await getEventsForEntity(entityType, entityId));
    setIsLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { events, isLoading, refetch };
}
