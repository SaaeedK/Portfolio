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

const COMPOSITE_SEP = ' · ';

/** Fields from `| stats count by src_ip, query` (pipeline segment only). */
export function parseStatsGroupBy(query: string): string[] {
  const m = query.match(/\|\s*stats\s+count\s+by\s+([\w\s,]+?)(?:\s*\||\s*$)/i);
  if (!m) return ['src_ip'];
  const fields = m[1].split(',').map((f) => f.trim().toLowerCase()).filter(Boolean);
  return fields.length ? fields : ['src_ip'];
}

/** Lab-default dimensions from aggregateLabel or scenario id. */
export function groupByFieldsForLab(labId: string, query?: string, aggregateLabel?: string): string[] {
  if (query && hasStatsCountPipeline(query)) {
    const parsed = parseStatsGroupBy(query);
    if (parsed.length) return parsed;
  }
  if (aggregateLabel) {
    const m = aggregateLabel.match(/count\s+by\s+(.+)$/i);
    if (m) {
      const fields = m[1].split(',').map((f) => f.trim().toLowerCase()).filter(Boolean);
      if (fields.length) return fields;
    }
  }
  const defaults: Record<string, string[]> = {
    LAB_01: ['src_ip'],
    LAB_02: ['src_ip', 'query'],
    LAB_03: ['src_ip', 'uri'],
  };
  return defaults[labId] ?? ['src_ip'];
}

function extractSrcIp(data: string): string | null {
  const client = data.match(/\bClient\s+((?:\d{1,3}\.){3}\d{1,3})\b/i);
  if (client) return client[1];
  const ips = data.match(IPV4) ?? [];
  return ips[0] ?? null;
}

function extractQueryDimension(data: string): string {
  const qry = data.match(/QRY\s+\S+\s+\S*\??\s*([\w.*-]+\.[a-z][\w.-]*)/i);
  if (qry) return qry[1].toLowerCase();
  const hay = data.toLowerCase();
  if (hay.includes('threshold exceeded') && hay.includes('update-check')) return '*.update-check.example';
  if (hay.includes('www.google.com')) return 'www.google.com';
  const domain = data.match(/\b([a-z0-9][-a-z0-9]*\.[a-z][-a-z0-9.]+)\b/i);
  if (domain && !/^\d/.test(domain[1])) return domain[1].toLowerCase();
  return '(unknown)';
}

function extractUriDimension(data: string): string {
  const verb = data.match(/\b(?:GET|POST|BLOCK|ALLOW)\s+(\/[^\s—]+)/i);
  if (verb) return verb[1];
  const path = data.match(/\s(\/[a-zA-Z0-9_./-]+)/);
  return path?.[1] ?? '(unknown)';
}

function buildAggregateKey(row: LabLogRow, fields: string[]): string {
  const parts: string[] = [];
  for (const f of fields) {
    if (f === 'src_ip') parts.push(extractSrcIp(row.data) ?? 'unknown');
    else if (f === 'query') parts.push(extractQueryDimension(row.data));
    else if (f === 'uri') parts.push(extractUriDimension(row.data));
    else parts.push(f);
  }
  if (fields.length === 1 && fields[0] === 'src_ip') return parts[0] ?? 'unknown';
  return parts.join(COMPOSITE_SEP);
}

export function aggregatesFromRowsByFields(rows: LabLogRow[], fields: string[]): LabAggregate[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = buildAggregateKey(row, fields);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([ip, count]) => ({ ip, count }))
    .sort((a, b) => b.count - a.count);
}

/** IP-only grouping (LAB_01 default). */
export function aggregatesFromRows(rows: LabLogRow[]): LabAggregate[] {
  return aggregatesFromRowsByFields(rows, ['src_ip']);
}

export function isLabQueryFiltered(rows: LabLogRow[], query: string): boolean {
  return filterLabRows(rows, query).length !== rows.length;
}

/** True when query includes a Splunk-style `| stats count by …` stage (client-side over visible rows). */
export function hasStatsCountPipeline(query: string): boolean {
  return /\|\s*stats\s+count\s+by\s+/i.test(query);
}

export type LabAggregateSource = 'sample' | 'filtered' | 'stats';

/** Pick aggregate bars: fictional SIEM totals, filtered counts, or stats pipeline on visible rows. */
export function resolveLabAggregates(
  rows: LabLogRow[],
  query: string,
  scenarioAggregates: LabAggregate[],
  labId: string,
  aggregateLabel?: string,
): { aggregates: LabAggregate[]; source: LabAggregateSource } {
  const filtered = filterLabRows(rows, query);
  const fields = groupByFieldsForLab(labId, query, aggregateLabel);
  if (hasStatsCountPipeline(query)) {
    return { aggregates: aggregatesFromRowsByFields(filtered, fields), source: 'stats' };
  }
  if (isLabQueryFiltered(rows, query)) {
    return { aggregates: aggregatesFromRowsByFields(filtered, fields), source: 'filtered' };
  }
  return { aggregates: scenarioAggregates, source: 'sample' };
}

/** `| stats count by` fields must match tokens in the scenario aggregateLabel. */
export function statsGroupByMatchesLabel(query: string, aggregateLabel: string): boolean {
  if (!hasStatsCountPipeline(query)) return true;
  const queryFields = parseStatsGroupBy(query);
  const m = aggregateLabel.match(/count\s+by\s+(.+)$/i);
  const labelFields = m ? m[1].split(',').map((f) => f.trim().toLowerCase()).filter(Boolean) : [];
  return queryFields.length === labelFields.length && queryFields.every((f, i) => f === labelFields[i]);
}
