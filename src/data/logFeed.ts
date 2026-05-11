import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, GitCommit, Info, Shield } from 'lucide-react';

export interface LogFeedEntry {
  timestamp: string;
  type: string;
  message: string;
  icon: LucideIcon;
  color: string;
}

export const logFeedEntries: LogFeedEntry[] = [
  {
    timestamp: '2024-10-27T08:14:02Z',
    type: 'OK',
    message: 'SYS_UPDATE: Kernel patched successfully. Version 6.5.0-generic applied.',
    icon: CheckCircle,
    color: 'text-secondary-fixed',
  },
  {
    timestamp: '2024-10-27T09:22:15Z',
    type: 'COMMIT',
    message: "GIT_PUSH: Repository 'auth-microservice' updated. SHA: a1b2c3d.",
    icon: GitCommit,
    color: 'text-primary-fixed',
  },
  {
    timestamp: '2024-10-27T11:05:44Z',
    type: 'WARNING',
    message:
      'AUTH_FAIL: Multiple failed login attempts detected from IP 192.168.1.105. Rate limiting applied.',
    icon: AlertTriangle,
    color: 'text-error-fixed',
  },
  {
    timestamp: '2024-10-27T13:40:10Z',
    type: 'INFO',
    message: "LAB_COMPLETE: Module 'Cryptography 101' finished. Score: 100%. Badge awarded.",
    icon: Shield,
    color: 'text-secondary-fixed',
  },
  {
    timestamp: '2024-10-27T14:15:00Z',
    type: 'OK',
    message: 'SEC_AUDIT: Daily automated dependency scan complete. 0 critical vulnerabilities found.',
    icon: CheckCircle,
    color: 'text-secondary-fixed',
  },
  {
    timestamp: '2024-10-27T15:30:22Z',
    type: 'INFO',
    message: 'CRON_JOB: Database backup routine executed. Archive stored in cold storage.',
    icon: Info,
    color: 'text-primary-fixed',
  },
];

/** Sample labels for the Logs page sidebar (fictional IPs for UI only). */
export const logThreatSidebar = [
  { type: 'SAMPLE', ip: '45.22.x.x', color: 'text-error-fixed' },
  { type: 'SAMPLE', ip: '103.4.x.x', color: 'text-error-fixed' },
  { type: 'SAMPLE', ip: '89.101.x.x', color: 'text-primary-fixed' },
] as const;
