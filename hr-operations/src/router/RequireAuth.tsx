import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDataSourceStore } from '../stores/dataSourceStore';

export function RequireAuth({ children }: { children: ReactNode }) {
  const isConnected = useDataSourceStore((s) => s.isConnected);
  const currentUser = useAuthStore((s) => s.currentUser);

  if (!isConnected) return <Navigate to="/settings" replace />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function roleHomePath(role: string): string {
  if (role === 'EMPLOYEE') return '/attendance';
  if (role === 'MANAGER') return '/manager/dashboard';
  return '/dashboard';
}
