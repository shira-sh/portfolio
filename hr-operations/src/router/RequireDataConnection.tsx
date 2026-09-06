import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useDataSourceStore } from '../stores/dataSourceStore';

export function RequireDataConnection({ children }: { children: ReactNode }) {
  const isConnected = useDataSourceStore((s) => s.isConnected);
  if (!isConnected) return <Navigate to="/settings" replace />;
  return <>{children}</>;
}
