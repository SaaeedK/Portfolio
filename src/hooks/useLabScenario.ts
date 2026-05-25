import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LAB_DATA_REVISION, labScenarios } from '@/data/labScenarios';
import { computeLabMetrics, findScenarioById } from '@/lib/labScenario';

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; scenarios: typeof labScenarios };

export function useLabScenario() {
  const [searchParams, setSearchParams] = useSearchParams();
  const labId = searchParams.get('lab');

  const load: LoadState = useMemo(() => {
    try {
      return { status: 'ready', scenarios: labScenarios };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load lab data';
      return { status: 'error', message };
    }
  }, []);

  useEffect(() => {
    if (load.status !== 'ready') return;
    const ids = load.scenarios.map((s) => s.id);
    const fallback = ids[0]!;
    if (!labId || !ids.includes(labId)) {
      setSearchParams({ lab: fallback }, { replace: true });
    }
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
    dataRevision: LAB_DATA_REVISION,
  };
}
