import { useNavigate } from 'react-router-dom';
import { LogOut, FileSpreadsheet, CheckCircle2, XCircle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useDataSourceStore } from '../stores/dataSourceStore';
import { USER_ROLE_LABELS } from '../config/labels';

export function Header() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const isConnected = useDataSourceStore((s) => s.isConnected);
  const fileName = useDataSourceStore((s) => s.fileName);
  const navigate = useNavigate();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5">
      <button
        type="button"
        onClick={() => navigate('/settings')}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
      >
        <FileSpreadsheet size={14} />
        {isConnected ? (
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle2 size={13} /> {fileName}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-500">
            <XCircle size={13} /> אין קובץ נתונים מחובר
          </span>
        )}
      </button>

      {currentUser && (
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="text-sm font-medium text-gray-800">{currentUser.displayName}</div>
            <div className="text-xs text-gray-400">{USER_ROLE_LABELS[currentUser.role]}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="rounded-md p-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
            aria-label="החלף משתמש"
            title="החלף משתמש"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  );
}
