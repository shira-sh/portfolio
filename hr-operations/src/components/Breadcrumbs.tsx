import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="ניווט מיקום" className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1.5">
          {index > 0 && <ChevronLeft size={14} className="text-gray-300" />}
          {item.to ? (
            <Link to={item.to} className="hover:text-gray-800">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-800">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
