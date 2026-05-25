import type { LabAggregate, LabLogRow } from '@/types';

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

function extractQuotedTokens(query: string): string[] {
  const tokens: string[] = [];
  for (const m of query.matchAll(/"([^"]+)"/g)) {
    const t = m[1].trim().toLowerCase();
    if (t) tokens.push(t);
  }
  return tokens;
}

function extractKeywordTokens(query: string): string[] {
  const q = query.toLowerCase();
  const tokens: string[] = [];
  if (/\bfail(ure|ed)?\b/.test(q) || q.includes('sshd_fail')) tokens.push('fail', 'failed', 'failure', 'sshd_fail', 'waf_block', 'http_403', 'dns_alert');
  if (/\bsuccess\b/.test(q) || q.includes('accepted')) tokens.push('success', 'accepted', 'sshd_success', 'waf_allow', 'http_200');
  if (/\bsession_open\b/.test(q)) tokens.push('session_open');
  if (/\bdns_query\b/.test(q)) tokens.push('dns_query');
  if (/\bwaf\b/.test(q)) tokens.push('waf');
  if (/\broot\b/.test(q)) tokens.push('root');
  if (/\badmin\b/.test(q)) tokens.push('admin');
  for (const ip of q.match(IPV4) ?? []) tokens.push(ip);
  return tokens;
}

/** Client-side filter only — query is never sent to a SIEM or database. */
export function filterLabRows(rows: LabLogRow[], query: string): LabLogRow[] {
  const quoted = extractQuotedTokens(query);
  const keywords = extractKeywordTokens(query);
  const tokens = [...new Set([...quoted, ...keywords])];
  if (tokens.length === 0) return rows;

  return rows.filter((row) => {
    const hay = `${row.type} ${row.data}`.toLowerCase();
    return tokens.some((t) => hay.includes(t));
  });
}

export function aggregatesFromRows(rows: LabLogRow[]): LabAggregate[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const ips = row.data.match(IPV4) ?? [];
    for (const ip of ips) {
      counts.set(ip, (counts.get(ip) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count);
}
