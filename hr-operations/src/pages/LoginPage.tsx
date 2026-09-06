import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserCircle2 } from 'lucide-react';
import { getDemoUsers } from '../services/authService';
import type { User } from '../types/entities';
import { USER_ROLE_LABELS } from '../config/labels';
import { useAuthStore } from '../stores/authStore';
import { roleHomePath } from '../router/RequireAuth';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';

export function LoginPage() {
  const [users, setUsers] = useState<User[] | null>(null);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  useEffect(() => {
    getDemoUsers().then(setUsers);
  }, []);

  function handleLogin(user: User) {
    login(user);
    navigate(roleHomePath(user.role));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Building2 size={26} />
          </div>
          <h1 className="text-lg font-bold text-gray-900">מרכז תפעול משאבי אנוש</h1>
          <p className="mt-1 text-sm text-gray-500">כניסת דמו - בחר/י משתמש להתחברות</p>
        </div>

        {users === null && <LoadingState message="טוען משתמשי דמו..." />}
        {users !== null && users.length === 0 && (
          <EmptyState message="לא נמצאו משתמשי דמו בקובץ הנתונים המחובר" />
        )}

        <div className="space-y-2">
          {users?.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleLogin(user)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200 p-3 text-right transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              <UserCircle2 size={28} className="shrink-0 text-gray-400" />
              <div>
                <div className="text-sm font-semibold text-gray-900">{user.displayName}</div>
                <div className="text-xs text-gray-500">{USER_ROLE_LABELS[user.role]}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
