export const MAX_QUERY_LEN = 2000;
const MAX_TERMINAL_LEN = 256;

/** Patterns that must never be accepted in user-editable query/terminal fields (portfolio sandbox). */
const BLOCKED_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /<\s*script/i, reason: 'HTML/script tags are not allowed' },
  { re: /<\s*iframe/i, reason: 'HTML iframe tags are not allowed' },
  { re: /<\s*img[^>]{0,200}\bon\w+\s*=/i, reason: 'inline event handlers are not allowed' },
  { re: /javascript:/i, reason: 'javascript: URLs are not allowed' },
  { re: /data:\s*text\/html/i, reason: 'data: HTML payloads are not allowed' },
  { re: /blob:/i, reason: 'blob: URLs are not allowed' },
  { re: /file:\/\//i, reason: 'file:// URLs are not allowed' },
  { re: /on\w+\s*=/i, reason: 'inline event handlers are not allowed' },
  { re: /\bimport\s+/i, reason: 'import statements are not allowed' },
  { re: /\brequire\s*\(/i, reason: 'require() is not allowed' },
  { re: /\bFunction\s*\(/i, reason: 'Function() is not allowed' },
  { re: /\beval\s*\(/i, reason: 'eval() is not allowed' },
  { re: /\b(document|window|localStorage|sessionStorage)\s*\./i, reason: 'DOM access is not allowed' },
  { re: /\{\{|\}\}/, reason: 'template injection delimiters are not allowed' },
  { re: /(?:\.\.\/|\.\.\\|%2e%2e)/i, reason: 'path traversal sequences are not allowed' },
  { re: /\bunion\b[\s\S]{0,40}\bselect\b/i, reason: 'SQL UNION patterns are not allowed' },
  { re: /\bselect\b[\s\S]{0,80}\bfrom\b/i, reason: 'SQL SELECT patterns are not allowed' },
  { re: /\b(drop|truncate)\s+(table|database)\b/i, reason: 'SQL DROP/TRUNCATE patterns are not allowed' },
  { re: /\b(delete|insert)\s+into\b/i, reason: 'SQL DELETE/INSERT patterns are not allowed' },
  { re: /\bupdate\s+\w+\s+set\b/i, reason: 'SQL UPDATE patterns are not allowed' },
  { re: /;\s*(drop|delete|exec|execute)\b/i, reason: 'chained SQL-style commands are not allowed' },
  { re: /(?:^|\s)--\s/, reason: 'SQL line comments are not allowed' },
  { re: /\/\*[\s\S]*\*\//, reason: 'SQL block comments are not allowed' },
  { re: /\b(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/i, reason: 'SQL tautology patterns are not allowed' },
  { re: /\b(exec|execute|xp_|sp_)\b/i, reason: 'shell/SQL exec keywords are not allowed' },
  { re: /`[^`]*`/, reason: 'backtick shell syntax is not allowed' },
  { re: /\$\(/, reason: 'command substitution is not allowed' },
  { re: /\|\s*sh\b/i, reason: 'piping to a shell is not allowed' },
  { re: /\b(cat|curl|wget|chmod|rm)\s+/i, reason: 'shell commands are not allowed' },
  { re: /\/etc\/|\/passwd\b/i, reason: 'sensitive path references are not allowed' },
  { re: /%00|\\x00|\\u0000/i, reason: 'null-byte injection is not allowed' },
  { re: /&#x[0-9a-f]+;|&lt;|&gt;/i, reason: 'HTML-encoded payloads are not allowed' },
];

function hasBlockedControlChars(s: string): boolean {
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c === 9 || c === 10 || c === 13) continue;
    if (c < 32 || c === 127) return true;
  }
  return false;
}

export type SecureInputResult =
  | { ok: true; value: string }
  | { ok: false; error: string; value: string };

function stripControls(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c === 9 || c === 10 || c === 13) out += ch;
    else if (c >= 32 && c !== 127) out += ch;
  }
  return out;
}

/** Decode a few common obfuscation forms before pattern matching. */
function decodeForScan(s: string): string {
  let d = s.normalize('NFKC');
  d = d.replace(/\\x([0-9a-f]{2})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
  d = d.replace(/\\u([0-9a-f]{4})/gi, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));
  d = d.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)));
  d = d.replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number.parseInt(num, 10)));
  return d;
}

function matchesBlockedPattern(s: string): string | null {
  const scan = decodeForScan(s);
  for (const { re, reason } of BLOCKED_PATTERNS) {
    re.lastIndex = 0;
    if (re.test(scan)) return reason;
  }
  return null;
}

export function validateSecureQueryInput(raw: string, maxLen = MAX_QUERY_LEN): SecureInputResult {
  const value = stripControls(raw);
  if (value.length > maxLen) {
    return { ok: false, error: `Query too long (max ${maxLen} characters).`, value: value.slice(0, maxLen) };
  }
  if (hasBlockedControlChars(value)) {
    return { ok: false, error: 'Control characters are not allowed.', value };
  }
  const blocked = matchesBlockedPattern(value);
  if (blocked) {
    return { ok: false, error: `Query blocked: ${blocked}`, value };
  }
  return { ok: true, value };
}

export function validateTerminalInput(raw: string): SecureInputResult {
  return validateSecureQueryInput(raw, MAX_TERMINAL_LEN);
}
