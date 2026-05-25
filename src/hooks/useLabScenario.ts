import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { computeLabMetrics, findScenarioById } from '@/lib/labScenario';
import type { LabScenario } from '@/types';

const SCENARIOS_URL = '/data/lab-scenarios.json';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; scenarios: LabScenario[] };

export function useLabScenario() {
  const [searchParams, setSearchParams] = useSearchParams();
  const labId = searchParams.get('lab');
  const [load, setLoad] = useState<LoadState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function loadScenarios() {
      try {
        const res = await fetch(SCENARIOS_URL, { headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as LabScenario[];
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Empty scenario list');
        }
        if (!cancelled) setLoad({ status: 'ready', scenarios: data });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load lab data';
        if (!cancelled) setLoad({ status: 'error', message });
      }
    }

    loadScenarios();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (load.status !== 'ready' || labId) return;
    setSearchParams({ lab: load.scenarios[0]!.id }, { replace: true });
  }, [load, labId, setSearchParams]);

  const scenario = useMemo(() => {
    if (load.status !== 'ready') return null;
    return findScenarioById(load.scenarios, labId);
  }, [load, labId]);

  const metrics = useMemo(() => (scenario ? computeLabMetrics(scenario) : null), [scenario]);

  const setLabId = (id: string) => {
    setSearchParams({ lab: id }, { replace: true });
  };

  const scenarioIds = load.status === 'ready' ? load.scenarios.map((s) => s.id) : [];

  return {
    load,
    scenario,
    metrics,
    labId: scenario?.id ?? labId,
    scenarioIds,
    setLabId,
  };
}
