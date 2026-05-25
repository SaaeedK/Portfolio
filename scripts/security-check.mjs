/**
 * Pre-push security gate (local + CI): dependency audit at high severity and above.
 * Secret scanning in CI uses gitleaks-action (see .github/workflows/ci.yml).
 */
import { execSync } from 'node:child_process';

console.log('▶ npm audit (high and above)');
try {
  execSync('npm audit --audit-level=high', { stdio: 'inherit' });
} catch {
  console.error('\nsecurity:check failed — fix high/critical npm advisories.');
  process.exit(1);
}

console.log('\nsecurity:check passed (run CI for gitleaks on push).');
