import type { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone?: 'default' | 'warning' | 'danger' | 'success';
  to?: string;
}

const TONE_CLASSES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  default: 'text-blue-600 bg-blue-50',
  warning: 'text-amber-600 bg-amber-50',
  danger: 'text-red-600 bg-red-50',
  success: 'text-emerald-600 bg-emerald-50',
};

export function KpiCard({ label, value, icon: Icon, tone = 'default', to }: KpiCardProps) {
  const navigate = useNavigate();
  const clickable = Boolean(to);

  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => to && navigate(to)}
      className={`flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-right shadow-sm transition ${
        clickable ? 'cursor-pointer hover:border-gray-300 hover:shadow-md' : 'cursor-default'
      }`}
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${TONE_CLASSES[tone]}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="truncate text-xs text-gray-500">{label}</div>
      </div>
    </button>
  );
}
