/**
 * Smoke-check LAB_01–03 queries using production splQuery + scenario JSON.
 * Run: npx --yes tsx scripts/verify-labs.ts
 */
import scenariosJson from '../src/data/lab-scenarios.json';
import { filterLabRows } from '../src/lib/splQuery';
import { validateSecureQueryInput } from '../src/lib/secureInput';
import type { LabScenario } from '../src/types';

const scenarios = scenariosJson as LabScenario[];

const EXPECTED: Record<
  string,
  { default: number; toolbox: { query: string; min: number; max: number }[] }
> = {
  LAB_01: {
    default: 5,
    toolbox: [
      { query: 'index=main sourcetype="linux_secure" action="failure" user="root"', min: 2, max: 3 },
      { query: 'index=main "Accepted password"', min: 1, max: 1 },
    ],
  },
  LAB_02: {
    default: 5,
    toolbox: [
      { query: 'index=network sourcetype=dns update-check.example', min: 3, max: 4 },
      { query: 'index=network "Threshold exceeded"', min: 1, max: 1 },
    ],
  },
  LAB_03: {
    default: 5,
    toolbox: [
      { query: 'index=web sourcetype=access_log src_ip=198.51.100.17', min: 4, max: 4 },
      { query: 'index=web sourcetype=access_log status>=400', min: 3, max: 3 },
      { query: 'index=web "webshell_signature"', min: 1, max: 1 },
    ],
  },
};

let failed = 0;

for (const scenario of scenarios) {
  const exp = EXPECTED[scenario.id];
  if (!exp) {
    console.error(`No expectations for ${scenario.id}`);
    failed++;
    continue;
  }

  const allQueries = [scenario.query, ...scenario.toolboxQueries];
  for (const q of allQueries) {
    const v = validateSecureQueryInput(q);
    if (!v.ok) {
      console.error(`${scenario.id}: query blocked unexpectedly: ${q}\n  → ${v.error}`);
      failed++;
    }
  }

  const def = filterLabRows(scenario.rows, scenario.query);
  if (def.length !== exp.default) {
    console.error(`${scenario.id} default: expected ${exp.default} rows, got ${def.length}`);
    failed++;
  } else {
    console.log(`OK ${scenario.id} default (${def.length} rows)`);
  }

  for (const t of exp.toolbox) {
    const got = filterLabRows(scenario.rows, t.query);
    if (got.length < t.min || got.length > t.max) {
      console.error(
        `${scenario.id} toolbox: expected ${t.min}-${t.max} rows, got ${got.length} for:\n  ${t.query}`,
      );
      failed++;
    } else {
      console.log(`OK ${scenario.id} toolbox (${got.length} rows)`);
    }
  }

  if (!scenario.rows.some((r) => r.data.includes(scenario.highlightIp))) {
    console.error(`${scenario.id}: highlightIp not found in row data`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll lab scenario checks passed.');
