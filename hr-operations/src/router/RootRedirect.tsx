import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDataSourceStore } from '../stores/dataSourceStore';
import { roleHomePath } from './RequireAuth';

export function RootRedirect() {
  const isConnected = useDataSourceStore((s) => s.isConnected);
  const currentUser = useAuthStore((s) => s.currentUser);

  if (!isConnected) return <Navigate to="/settings" replace />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <Navigate to={roleHomePath(currentUser.role)} replace />;
}
