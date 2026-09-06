import { BADGE_TONE_CLASSES, type BadgeTone } from '../config/badgeColors';

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function StatusBadge({ label, tone = 'gray' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${BADGE_TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}
