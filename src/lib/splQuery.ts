import type { LabAggregate, LabLogRow } from '@/types';

const IPV4 = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;

/** Map Splunk-style sourcetype names to substrings present in curated lab rows. */
const SOURCETYPE_HINTS: Record<string, string[]> = {
  linux_secure: [
    'sshd_fail',
    'sshd_success',
    'session_open',
    'failed password',
    'accepted password',
    'pam_unix',
  ],
  dns: ['dns_query', 'dns_alert', 'dns_response', 'query', 'noerror', 'threshold exceeded', 'qry'],
  access_log: ['waf_block', 'waf_allow', 'http_403', 'http_200', 'msf_probe', 'post', 'get', 'webshell'],
};

const FAILURE_HINTS = ['fail', 'failed', 'failure', 'sshd_fail', 'waf_block', 'http_403', 'dns_alert', 'block'];
const SUCCESS_HINTS = ['success', 'accepted', 'sshd_success', 'waf_allow', 'http_200', 'allow'];

/** SPL search head only — pipeline stages (| stats, | where, …) do not filter raw rows here. */
function searchHead(query: string): string {
  const pipe = query.indexOf('|');
  return (pipe === -1 ? query : query.slice(0, pipe)).trim();
}

interface QueryConstraints {
  sourcetypes: string[];
  users: string[];
  hostPatterns: string[];
  uriPatterns: string[];
  requireFailure: boolean;
  requireSuccess: boolean;
  minStatus: number | null;
  exactStatus: number | null;
  quotedPhrases: string[];
  ips: string[];
}

function normalizeSearchPattern(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/^\*+\.?/, '')
    .replace(/\*+/g, '')
    .trim();
}

function extractSourcetypes(query: string): string[] {
  const out: string[] = [];
  for (const m of query.matchAll(/\bsourcetype\s*=\s*(?:"([^"]+)"|(\S+))/gi)) {
    const v = (m[1] ?? m[2] ?? '').trim().toLowerCase();
    if (v) out.push(v);
  }
  return out;
}

function extractFieldValues(query: string, field: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`\\b${field}\\s*=\\s*(?:"([^"]+)"|(\\S+))`, 'gi');
  for (const m of query.matchAll(re)) {
    const v = (m[1] ?? m[2] ?? '').trim().toLowerCase();
    if (v) out.push(v);
  }
  return out;
}

function extractQuotedPhrases(query: string): string[] {
  const fieldQuoted = new Set<string>();
  for (const m of query.matchAll(/\b(user|action|sourcetype|uri|query|src_ip)\s*=\s*"([^"]+)"/gi)) {
    fieldQuoted.add(m[2].trim().toLowerCase());
  }
  const phrases: string[] = [];
  for (const m of query.matchAll(/"([^"]+)"/g)) {
    const lower = m[1].trim().toLowerCase();
    if (!lower || fieldQuoted.has(lower)) continue;
    phrases.push(lower);
  }
  return phrases;
}

function extractStatusConstraints(query: string): { minStatus: number | null; exactStatus: number | null } {
  let minStatus: number | null = null;
  let exactStatus: number | null = null;
  const ge = query.match(/\bstatus\s*>=\s*(\d+)/i);
  if (ge) minStatus = Number.parseInt(ge[1], 10);
  const eq = query.match(/\bstatus\s*=\s*(\d+)/i);
  if (eq) exactStatus = Number.parseInt(eq[1], 10);
  return { minStatus, exactStatus };
}

function hasFailureIntent(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /\baction\s*=\s*"?failure"?/.test(q) ||
    /\bfail(ure|ed)?\b/.test(q) ||
    q.includes('sshd_fail') ||
    q.includes('waf_block') ||
    q.includes('http_403')
  );
}

function hasSuccessIntent(query: string): boolean {
  const q = query.toLowerCase();
  return (
    /\baction\s*=\s*"?success"?/.test(q) ||
    (/\baccepted\b/.test(q) && !hasFailureIntent(query)) ||
    q.includes('sshd_success')
  );
}

function rowMatchesStatus(row: LabLogRow, minStatus: number | null, exactStatus: number | null): boolean {
  const hay = `${row.type} ${row.data}`.toLowerCase();
  if (exactStatus !== null) {
    return hay.includes(String(exactStatus)) || (exactStatus === 200 && row.type === 'http_200');
  }
  if (minStatus !== null && minStatus >= 400) {
    return (
      row.severity === 'error' ||
      row.type.includes('403') ||
      row.type.includes('block') ||
      /\b403\b/.test(hay) ||
      /\bblock\b/.test(hay)
    );
  }
  return true;
}

function rowMatchesGroup(hay: string, tokens: string[]): boolean {
  return tokens.some((t) => hay.includes(t));
}

function extractBareHostPatterns(query: string): string[] {
  let q = query.toLowerCase();
  q = q.replace(/\b(index|sourcetype|user|action|status|src_ip|uri|query)\s*=\s*"[^"]*"/gi, '');
  q = q.replace(/\b(index|sourcetype|src_ip|uri|query)\s*=\s*\S+/gi, '');
  q = q.replace(/\|[^\n]*/g, '');
  const patterns: string[] = [];
  for (const m of q.matchAll(/\b([a-z0-9][-a-z0-9.*]*\.[a-z][-a-z0-9.]*)\b/g)) {
    const norm = normalizeSearchPattern(m[1]);
    if (norm.length > 4) patterns.push(norm);
  }
  return patterns;
}

function buildConstraints(query: string): QueryConstraints {
  const head = searchHead(query);
  const q = head.toLowerCase();
  const { minStatus, exactStatus } = extractStatusConstraints(head);
  const queryField = extractFieldValues(head, 'query').map(normalizeSearchPattern).filter(Boolean);
  const uriField = extractFieldValues(head, 'uri').map(normalizeSearchPattern).filter(Boolean);
  const srcIpField = extractFieldValues(head, 'src_ip');
  const hostPatterns = [...new Set([...queryField, ...extractBareHostPatterns(head)])];
  return {
    sourcetypes: extractSourcetypes(head),
    users: extractFieldValues(head, 'user'),
    hostPatterns,
    uriPatterns: uriField,
    requireFailure: hasFailureIntent(head),
    requireSuccess: hasSuccessIntent(head),
    minStatus,
    exactStatus,
    quotedPhrases: extractQuotedPhrases(head),
    ips: [...new Set([...(q.match(IPV4) ?? []), ...srcIpField])],
  };
}

function hasSubstantiveFilters(c: QueryConstraints): boolean {
  return (
    c.sourcetypes.length > 0 ||
    c.users.length > 0 ||
    c.hostPatterns.length > 0 ||
    c.uriPatterns.length > 0 ||
    c.requireFailure ||
    c.requireSuccess ||
    c.minStatus !== null ||
    c.exactStatus !== null ||
    c.quotedPhrases.length > 0 ||
    c.ips.length > 0
  );
}

function rowMatchesConstraints(row: LabLogRow, c: QueryConstraints): boolean {
  const hay = `${row.type} ${row.data}`.toLowerCase();

  if (c.sourcetypes.length > 0) {
    const hints = c.sourcetypes.flatMap((st) => SOURCETYPE_HINTS[st] ?? [st]);
    if (!rowMatchesGroup(hay, hints)) return false;
  }

  if (c.users.length > 0 && !c.users.every((u) => hay.includes(u))) return false;

  if (c.hostPatterns.length > 0 && !c.hostPatterns.some((p) => hay.includes(p))) return false;

  if (c.uriPatterns.length > 0 && !c.uriPatterns.some((p) => hay.includes(p))) return false;

  if (c.requireFailure && !rowMatchesGroup(hay, FAILURE_HINTS)) return false;

  if (c.requireSuccess && !rowMatchesGroup(hay, SUCCESS_HINTS)) return false;

  if (!rowMatchesStatus(row, c.minStatus, c.exactStatus)) return false;

  if (c.quotedPhrases.length > 0 && !c.quotedPhrases.every((p) => hay.includes(p))) return false;

  if (c.ips.length > 0 && !c.ips.some((ip) => hay.includes(ip))) return false;

  return true;
}

/** Client-side filter only — query is never sent to a SIEM or database. */
export function filterLabRows(rows: LabLogRow[], query: string): LabLogRow[] {
  const constraints = buildConstraints(query);
  if (!hasSubstantiveFilters(constraints)) return rows;
  return rows.filter((row) => rowMatchesConstraints(row, constraints));
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

export function isLabQueryFiltered(rows: LabLogRow[], query: string): boolean {
  return filterLabRows(rows, query).length !== rows.length;
}
