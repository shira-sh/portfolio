import { NavLink } from 'react-router-dom';
import { Building2 } from 'lucide-react';
import { NAV_ITEMS } from '../config/navigation';
import { useAuthStore } from '../stores/authStore';

export function Sidebar() {
  const currentUser = useAuthStore((s) => s.currentUser);
  if (!currentUser) return null;

  const items = NAV_ITEMS.filter((item) => item.isVisible(currentUser));

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-l border-gray-200 bg-white md:flex">
      <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
        <Building2 size={22} className="text-blue-600" />
        <div className="text-sm font-bold text-gray-900">מרכז תפעול משאבי אנוש</div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
