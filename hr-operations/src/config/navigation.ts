import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  AlertTriangle,
  Network,
  FileSpreadsheet,
  ScrollText,
  Settings,
  ClipboardList,
} from 'lucide-react';
import type { User } from '../types/entities';
import {
  canImportExport,
  canViewAuditLog,
  canViewDashboard,
  canViewManagerDashboard,
  canViewOrgStructure,
} from '../permissions/policies';
import { UserRole } from '../types/enums';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  isVisible: (user: User) => boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'דשבורד',
    to: '/dashboard',
    icon: LayoutDashboard,
    isVisible: (user) => canViewDashboard(user),
  },
  {
    label: 'דשבורד ניהולי',
    to: '/manager/dashboard',
    icon: LayoutDashboard,
    isVisible: (user) => canViewManagerDashboard(user),
  },
  {
    label: 'נוכחות אישית',
    to: '/attendance',
    icon: Clock,
    isVisible: (user) => user.role === UserRole.EMPLOYEE || user.role === UserRole.MANAGER,
  },
  {
    label: 'עובדים',
    to: '/employees',
    icon: Users,
    isVisible: (user) => user.role !== UserRole.EMPLOYEE,
  },
  {
    label: 'קליטת עובדים',
    to: '/employees/pending',
    icon: UserPlus,
    isVisible: (user) => user.role !== UserRole.EMPLOYEE,
  },
  {
    label: 'חריגי נוכחות',
    to: '/exceptions',
    icon: AlertTriangle,
    isVisible: (user) => user.role !== UserRole.EMPLOYEE,
  },
  {
    label: 'מבנה ארגוני',
    to: '/organization',
    icon: Network,
    isVisible: (user) => canViewOrgStructure(user),
  },
  {
    label: 'ייבוא וייצוא',
    to: '/import-export',
    icon: FileSpreadsheet,
    isVisible: (user) => canImportExport(user),
  },
  {
    label: 'יומן פעילות',
    to: '/audit',
    icon: ScrollText,
    isVisible: (user) => canViewAuditLog(user),
  },
  {
    label: 'דוחות',
    to: '/reports',
    icon: ClipboardList,
    isVisible: (user) => user.role !== UserRole.EMPLOYEE,
  },
  {
    label: 'הגדרות',
    to: '/settings',
    icon: Settings,
    isVisible: () => true,
  },
];
