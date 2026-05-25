import scenariosJson from './lab-scenarios.json';
import type { LabScenario } from '@/types';

/** Bump when row data changes — shown on /labs so you can confirm the bundle reloaded. */
export const LAB_DATA_REVISION = '2026-05-24.1';

function parseLabScenarios(data: unknown): LabScenario[] {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('lab-scenarios.json must be a non-empty array');
  }
  for (const item of data) {
    if (
      typeof item !== 'object' ||
      item === null ||
      typeof (item as LabScenario).id !== 'string' ||
      !Array.isArray((item as LabScenario).rows)
    ) {
      throw new Error('Invalid lab scenario entry in lab-scenarios.json');
    }
  }
  return data as LabScenario[];
}

export const labScenarios = parseLabScenarios(scenariosJson);
