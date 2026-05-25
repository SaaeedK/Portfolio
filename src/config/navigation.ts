/** Primary site navigation — paths must stay in sync with src/routes.tsx. */
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FlaskConical,
  ScrollText,
  MessageSquare,
} from 'lucide-react';

export type NavItem = {
  name: string;
  path: string;
  icon: LucideIcon;
};

export const primaryNav = [
  { name: 'DASHBOARD', path: '/', icon: LayoutDashboard },
  { name: 'LABS', path: '/labs', icon: FlaskConical },
  { name: 'LOGS', path: '/logs', icon: ScrollText },
  { name: 'COMMS', path: '/comms', icon: MessageSquare },
] as const satisfies readonly NavItem[];
