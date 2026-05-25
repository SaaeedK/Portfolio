/** Client input guardrails for lab queries and the Logs terminal. */
import { describe, expect, it } from 'vitest';
import { validateSecureQueryInput, validateTerminalInput } from '@/lib/secureInput';

describe('validateSecureQueryInput', () => {
  it('accepts benign SPL-style text', () => {
    const result = validateSecureQueryInput('sourcetype=linux_secure failed');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toContain('linux_secure');
  });

  it('blocks script tags', () => {
    const result = validateSecureQueryInput('<script>alert(1)</script>');
    expect(result.ok).toBe(false);
  });

  it('blocks SQL UNION patterns', () => {
    const result = validateSecureQueryInput('foo union select * from users');
    expect(result.ok).toBe(false);
  });

  it('enforces max length', () => {
    const result = validateSecureQueryInput('a'.repeat(2500));
    expect(result.ok).toBe(false);
  });
});

describe('validateTerminalInput', () => {
  it('allows short filter notes', () => {
    const result = validateTerminalInput('host=web01');
    expect(result.ok).toBe(true);
  });

  it('rejects shell commands', () => {
    const result = validateTerminalInput('curl https://evil.test');
    expect(result.ok).toBe(false);
  });
});
