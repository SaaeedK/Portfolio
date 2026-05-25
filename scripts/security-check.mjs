/**
 * Pre-push security gate (local + CI): dependency audit at high severity and above,
 * plus guardrails that secrets and build artifacts are not tracked in git.
 * Secret scanning in CI uses gitleaks-action (see .github/workflows/ci.yml).
 */
import { execSync } from 'node:child_process';

const tracked = execSync('git ls-files', { encoding: 'utf8' })
  .split(/\r?\n/)
  .map((p) => p.trim())
  .filter(Boolean);

const forbiddenPatterns = [
  /^\.env(?!\.example$)/,
  /^\.dev\.vars$/,
  /^\.firebaserc$/,
  /^dist\//,
  /^node_modules\//,
  /^\.wrangler\//,
];

const blocked = tracked.filter((p) => forbiddenPatterns.some((re) => re.test(p)));
if (blocked.length > 0) {
  console.error('security:check failed — remove these from git (use .gitignore):');
  for (const p of blocked) console.error(`  - ${p}`);
  process.exit(1);
}

console.log('▶ tracked-files guard (no .env, dist/, node_modules/)');
console.log('  ok');

console.log('\n▶ npm audit (high and above)');
try {
  execSync('npm audit --audit-level=high', { stdio: 'inherit' });
} catch {
  console.error('\nsecurity:check failed — fix high/critical npm advisories.');
  process.exit(1);
}

console.log('\nsecurity:check passed (run CI for gitleaks on push).');
