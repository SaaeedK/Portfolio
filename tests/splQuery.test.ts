/** SPL parser regression tests against bundled lab row shapes. */
import { describe, expect, it } from 'vitest';
import type { LabLogRow } from '@/types';
import { filterLabRows, isLabQueryFiltered } from '@/lib/splQuery';

const sampleRows: LabLogRow[] = [
  {
    time: '2024-10-27T11:05:44Z',
    type: 'sshd_fail',
    data: 'Failed password for root from 192.168.1.105 port 49122 ssh2',
    severity: 'error',
  },
  {
    time: '2024-10-27T11:05:48Z',
    type: 'sshd_success',
    data: 'Accepted password for root from 192.168.1.105 port 49122 ssh2',
    severity: 'success',
  },
  {
    time: '2024-10-27T11:06:00Z',
    type: 'waf_allow',
    data: 'GET /api/health HTTP/1.1 200',
    severity: 'info',
  },
];

describe('filterLabRows', () => {
  it('returns all rows for empty search head', () => {
    expect(filterLabRows(sampleRows, '').length).toBe(3);
  });

  it('filters by sourcetype', () => {
    const filtered = filterLabRows(sampleRows, 'sourcetype=linux_secure');
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((r) => r.type.includes('sshd') || r.data.includes('pam'))).toBe(true);
  });

  it('detects when a query narrows results', () => {
    expect(isLabQueryFiltered(sampleRows, 'sourcetype=linux_secure failed')).toBe(true);
    expect(isLabQueryFiltered(sampleRows, '')).toBe(false);
  });
});
