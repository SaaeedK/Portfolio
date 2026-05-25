/**
 * Smoke-check LAB_01–03 queries using production splQuery + scenario JSON.
 * Run: npx --yes tsx scripts/verify-labs.ts
 */
/**
 * Predev/prebuild gate: asserts SPL toolbox queries return expected row counts
 * against bundled lab-scenarios.json (keeps /labs demos consistent).
 */
import scenariosJson from '../src/data/lab-scenarios.json';
import { formatLabRowTime, sortLabRowsByTime } from '../src/lib/labScenario';
import {
  filterLabRows,
  hasStatsCountPipeline,
  resolveLabAggregates,
  statsGroupByMatchesLabel,
} from '../src/lib/splQuery';
import { validateSecureQueryInput } from '../src/lib/secureInput';
import type { LabScenario } from '../src/types';

const scenarios = scenariosJson as LabScenario[];

/** Earliest row _time per lab (UTC) — must match src/data/lab-scenarios.json. */
const EARLIEST_UTC: Record<string, string> = {
  LAB_01: '2024-10-27 11:05:44',
  LAB_02: '2024-10-27 15:31:02',
  LAB_03: '2024-10-27 18:44:01',
};

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
      { query: 'index=web "webshell_signature"', min: 1, max: 1 },
      { query: 'index=web sourcetype=access_log status>=400', min: 3, max: 3 },
    ],
  },
};

/** Per-lab `| stats` toolbox (middle snippet) expectations. */
const STATS_EXPECT: Record<
  string,
  { minKeys: number; mustInclude?: string; topKey?: string; topCount?: number }
> = {
  LAB_01: { minKeys: 2, topKey: '192.168.1.105', topCount: 3 },
  LAB_02: { minKeys: 3, mustInclude: 'update-check.example' },
  LAB_03: { minKeys: 4, mustInclude: '198.51.100.17 · /upload.php' },
};

let failed = 0;

function assertUnique(values: string[], label: string): void {
  const seen = new Set<string>();
  for (const v of values) {
    if (seen.has(v)) {
      console.error(`Duplicate ${label}: ${v}`);
      failed++;
      return;
    }
    seen.add(v);
  }
}

assertUnique(scenarios.map((s) => s.id), 'scenario id');
assertUnique(scenarios.map((s) => s.query), 'default query');
assertUnique(scenarios.map((s) => s.aggregateLabel), 'aggregateLabel');
assertUnique(scenarios.map((s) => s.highlightIp), 'highlightIp');

const rowOwnerByData = new Map<string, string>();
for (const scenario of scenarios) {
  for (const row of scenario.rows) {
    const owner = rowOwnerByData.get(row.data);
    if (owner && owner !== scenario.id) {
      console.error(
        `Duplicate row data between ${owner} and ${scenario.id}: ${row.data.slice(0, 60)}…`,
      );
      failed++;
    }
    rowOwnerByData.set(row.data, scenario.id);
  }
}
if (failed === 0) {
  console.log('OK cross-lab uniqueness (id, query, aggregateLabel, highlightIp, row data)');
}

const TOOLBOX_COUNTS: Record<string, number> = { LAB_01: 3, LAB_02: 3, LAB_03: 4 };
assertUnique(scenarios.flatMap((s) => s.toolboxQueries), 'toolbox query (across labs)');
if (failed === 0) {
  console.log('OK cross-lab toolbox query uniqueness');
}

for (const scenario of scenarios) {
  const expectedCount = TOOLBOX_COUNTS[scenario.id];
  if (expectedCount === undefined) {
    console.error(`No toolbox count expectation for ${scenario.id}`);
    failed++;
  } else if (scenario.toolboxQueries.length !== expectedCount) {
    console.error(
      `${scenario.id}: expected ${expectedCount} toolbox queries, got ${scenario.toolboxQueries.length}`,
    );
    failed++;
  }
}
if (failed === 0) {
  console.log('OK per-lab toolbox counts (3/3/4)');
}

const blockedProbe = validateSecureQueryInput('<script>alert(1)</script>');
if (blockedProbe.ok) {
  console.error('Security: script tag should be blocked in query input');
  failed++;
} else {
  console.log('OK blocked-query security smoke');
}

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

  const statsToolbox = scenario.toolboxQueries.find((q) => hasStatsCountPipeline(q));
  if (statsToolbox) {
    if (!statsGroupByMatchesLabel(statsToolbox, scenario.aggregateLabel)) {
      console.error(
        `${scenario.id}: stats toolbox fields do not match aggregateLabel "${scenario.aggregateLabel}":\n  ${statsToolbox}`,
      );
      failed++;
    } else {
      console.log(`OK ${scenario.id} stats toolbox matches aggregateLabel`);
    }
  } else {
    console.error(`${scenario.id}: missing | stats toolbox snippet`);
    failed++;
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

  const expectedUtc = EARLIEST_UTC[scenario.id];
  if (expectedUtc) {
    const earliest = sortLabRowsByTime(scenario.rows)[0];
    const got = earliest ? formatLabRowTime(earliest.time) : '';
    if (got !== expectedUtc) {
      console.error(`${scenario.id}: expected earliest _time ${expectedUtc}, got ${got || '(none)'}`);
      failed++;
    } else {
      console.log(`OK ${scenario.id} earliest _time ${got}`);
    }
  }

  const statsQuery = scenario.toolboxQueries.find((q) => hasStatsCountPipeline(q));
  const statsExp = STATS_EXPECT[scenario.id];
  if (statsQuery && statsExp) {
    const v = validateSecureQueryInput(statsQuery);
    if (!v.ok) {
      console.error(`${scenario.id} stats pipeline blocked: ${statsQuery}`);
      failed++;
    } else {
      const { aggregates, source } = resolveLabAggregates(
        scenario.rows,
        v.value,
        scenario.aggregates,
        scenario.id,
        scenario.aggregateLabel,
      );
      if (source !== 'stats') {
        console.error(`${scenario.id} stats pipeline: expected source=stats, got ${source}`);
        failed++;
      } else if (aggregates.length < statsExp.minKeys) {
        console.error(
          `${scenario.id} stats pipeline: expected >=${statsExp.minKeys} keys, got ${aggregates.length}`,
        );
        failed++;
      } else if (statsExp.mustInclude && !aggregates.some((a) => a.ip.includes(statsExp.mustInclude!))) {
        console.error(
          `${scenario.id} stats pipeline: missing key containing "${statsExp.mustInclude}"`,
        );
        failed++;
      } else if (statsExp.topKey) {
        const top = aggregates.find((a) => a.ip === statsExp.topKey);
        if (!top || top.count !== statsExp.topCount) {
          console.error(
            `${scenario.id} stats pipeline: expected ${statsExp.topKey}=${statsExp.topCount}, got ${top?.count ?? 'n/a'}`,
          );
          failed++;
        } else {
          console.log(`OK ${scenario.id} stats pipeline (${statsExp.topKey}=${top.count}, ${aggregates.length} keys)`);
        }
      } else {
        console.log(`OK ${scenario.id} stats pipeline (${aggregates.length} keys)`);
      }
    }
  }
}

if (failed) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAll lab scenario checks passed.');
