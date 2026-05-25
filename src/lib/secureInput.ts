const MAX_QUERY_LEN = 2000;
const MAX_TERMINAL_LEN = 256;

/** Patterns that must never be accepted in user-editable query/terminal fields (portfolio sandbox). */
const BLOCKED_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /<\s*script/i, reason: 'HTML/script tags are not allowed' },
  { re: /javascript:/i, reason: 'javascript: URLs are not allowed' },
  { re: /on\w+\s*=/i, reason: 'inline event handlers are not allowed' },
  { re: /\bunion\b[\s\S]{0,40}\bselect\b/i, reason: 'SQL UNION patterns are not allowed' },
  { re: /\b(drop|truncate)\s+(table|database)\b/i, reason: 'SQL DROP/TRUNCATE patterns are not allowed' },
  { re: /\b(delete|insert)\s+into\b/i, reason: 'SQL DELETE/INSERT patterns are not allowed' },
  { re: /\bupdate\s+\w+\s+set\b/i, reason: 'SQL UPDATE patterns are not allowed' },
  { re: /;\s*(drop|delete|exec|execute)\b/i, reason: 'chained SQL-style commands are not allowed' },
  { re: /(?:^|\s)--\s/, reason: 'SQL line comments are not allowed' },
  { re: /\/\*[\s\S]*\*\//, reason: 'SQL block comments are not allowed' },
  { re: /\b(exec|execute|xp_|sp_)\b/i, reason: 'shell/SQL exec keywords are not allowed' },
  { re: /\beval\s*\(/i, reason: 'eval() is not allowed' },
  { re: /`[^`]*`/, reason: 'backtick shell syntax is not allowed' },
  { re: /\$\(/, reason: 'command substitution is not allowed' },
  { re: /\|\s*sh\b/i, reason: 'piping to a shell is not allowed' },
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

export function validateSecureQueryInput(raw: string, maxLen = MAX_QUERY_LEN): SecureInputResult {
  const value = stripControls(raw);
  if (value.length > maxLen) {
    return { ok: false, error: `Query too long (max ${maxLen} characters).`, value: value.slice(0, maxLen) };
  }
  if (hasBlockedControlChars(value)) {
    return { ok: false, error: 'control characters are not allowed', value };
  }
  for (const { re, reason } of BLOCKED_PATTERNS) {
    if (re.test(value)) {
      return { ok: false, error: reason, value };
    }
  }
  return { ok: true, value };
}

export function validateTerminalInput(raw: string): SecureInputResult {
  return validateSecureQueryInput(raw, MAX_TERMINAL_LEN);
}
