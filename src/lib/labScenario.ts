/** Lab scenario helpers: time formatting, metrics, IP highlight, and scenario lookup. */
import type { LabAggregate, LabLogRow, LabScenario } from '@/types';

export interface LabAggregateBar extends LabAggregate {
  severity: number;
  color: 'bg-error-fixed' | 'bg-secondary-fixed';
}

export interface LabScenarioMetrics {
  totalEvents: number;
  /** Simulated SPL execution latency (header). */
  queryTimeSec: string;
  /** Wall-clock span from earliest to latest visible row (_time), in seconds. */
  eventSpanSec: string | null;
  narrativeWeight: number;
  aggregateBars: LabAggregateBar[];
}

/** Parse curated row timestamps (ISO or legacy `YYYY-MM-DD HH:mm:ss`). */
export function parseLabRowTime(time: string): Date | null {
  const trimmed = time.trim();
  if (!trimmed) return null;
  const iso = trimmed.includes('T') ? trimmed : `${trimmed.replace(' ', 'T')}Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Splunk-style UTC display — consistent across all labs. */
export function formatLabRowTime(time: string): string {
  const d = parseLabRowTime(time);
  if (!d) return time;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
}

export function sortLabRowsByTime(rows: LabLogRow[]): LabLogRow[] {
  return [...rows].sort((a, b) => {
    const ta = parseLabRowTime(a.time)?.getTime() ?? 0;
    const tb = parseLabRowTime(b.time)?.getTime() ?? 0;
    return ta - tb;
  });
}

function eventSpanSec(rows: LabLogRow[]): string | null {
  const stamps = rows.map((r) => parseLabRowTime(r.time)?.getTime()).filter((t): t is number => t != null);
  if (stamps.length < 2) return stamps.length === 1 ? '0.0' : null;
  const span = (Math.max(...stamps) - Math.min(...stamps)) / 1000;
  return span.toFixed(1);
}

export function computeLabMetrics(
  scenario: LabScenario,
  options?: { rows?: LabLogRow[]; aggregates?: LabAggregate[] },
): LabScenarioMetrics {
  const rows = options?.rows ?? scenario.rows;
  const aggregates = options?.aggregates ?? scenario.aggregates;

  /** Header/table always reflects visible raw rows; aggregate bars carry SIEM-scale totals. */
  const totalEvents = rows.length;
  const maxCount = Math.max(...aggregates.map((row) => row.count), 1);
  const topCount = maxCount;

  const aggregateBars: LabAggregateBar[] = aggregates.map((row) => ({
    ...row,
    severity: Math.round((row.count / maxCount) * 100),
    color: row.count === topCount ? 'bg-error-fixed' : 'bg-secondary-fixed',
  }));

  const failCount = rows.filter((row) => row.severity === 'error').length;
  const narrativeWeight = rows.length
    ? Math.min(99, Math.max(35, Math.round((failCount / rows.length) * 55 + 40)))
    : 50;

  const queryTimeSec = (0.15 + rows.length * 0.07 + aggregates.length * 0.12).toFixed(1);

  return { totalEvents, queryTimeSec, eventSpanSec: eventSpanSec(rows), narrativeWeight, aggregateBars };
}

export function rowSeverityClass(row: LabLogRow): string {
  if (row.severity === 'error' || row.type === 'msf_probe' || row.type === 'dns_alert') {
    return 'bg-error-fixed/10 text-error-fixed border-error-fixed/30';
  }
  if (row.severity === 'success') {
    return 'bg-secondary-fixed/10 text-secondary-fixed border-secondary-fixed/30';
  }
  return 'bg-surface-variant text-on-surface-variant border-outline-variant/30';
}

export function highlightTokenInText(text: string, token: string): { before: string; match: string; after: string }[] {
  if (!token || !text.includes(token)) {
    return [{ before: text, match: '', after: '' }];
  }
  const parts: { before: string; match: string; after: string }[] = [];
  let rest = text;
  while (rest.includes(token)) {
    const idx = rest.indexOf(token);
    if (idx > 0) parts.push({ before: rest.slice(0, idx), match: '', after: '' });
    parts.push({ before: '', match: token, after: '' });
    rest = rest.slice(idx + token.length);
  }
  if (rest) parts.push({ before: rest, match: '', after: '' });
  return parts;
}

export function findScenarioById(scenarios: LabScenario[], id: string | null): LabScenario {
  const match = scenarios.find((s) => s.id === id);
  return match ?? scenarios[0];
}
