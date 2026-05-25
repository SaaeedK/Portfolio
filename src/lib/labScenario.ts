import type { LabAggregate, LabLogRow, LabScenario } from '@/types';

export interface LabAggregateBar extends LabAggregate {
  severity: number;
  color: 'bg-error-fixed' | 'bg-secondary-fixed';
}

export interface LabScenarioMetrics {
  totalEvents: number;
  queryTimeSec: string;
  narrativeWeight: number;
  aggregateBars: LabAggregateBar[];
}

export function computeLabMetrics(scenario: LabScenario): LabScenarioMetrics {
  const totalEvents = scenario.aggregates.reduce((sum, row) => sum + row.count, 0);
  const maxCount = Math.max(...scenario.aggregates.map((row) => row.count), 1);
  const topCount = maxCount;

  const aggregateBars: LabAggregateBar[] = scenario.aggregates.map((row) => ({
    ...row,
    severity: Math.round((row.count / maxCount) * 100),
    color: row.count === topCount ? 'bg-error-fixed' : 'bg-secondary-fixed',
  }));

  const failCount = scenario.rows.filter((row) => row.severity === 'error').length;
  const narrativeWeight = scenario.rows.length
    ? Math.min(99, Math.max(35, Math.round((failCount / scenario.rows.length) * 55 + 40)))
    : 50;

  const queryTimeSec = (0.15 + scenario.rows.length * 0.07 + scenario.aggregates.length * 0.12).toFixed(1);

  return { totalEvents, queryTimeSec, narrativeWeight, aggregateBars };
}

export function rowSeverityClass(row: LabLogRow): string {
  if (row.severity === 'error') {
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
