import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import type { User } from '../types/entities';

export function RequirePermission({
  check,
  children,
}: {
  check: (user: User) => boolean;
  children: ReactNode;
}) {
  const currentUser = useAuthStore((s) => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!check(currentUser)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}
