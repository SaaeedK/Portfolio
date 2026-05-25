export interface Lab {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'ACTIVE' | 'PENDING' | 'COMPLETED';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'CRITICAL';
  icon: string;
  /** Stable bar heights for the home card visualizer (avoids Math.random in render). */
  visualizerHeights?: number[];
}

export interface Commit {
  id: string;
  hash: string;
  role: string;
  company: string;
  details: string[];
  date: string;
  branch?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech: string;
  icon: string;
  status: string;
  /** When set, project card links to the repository. */
  repoUrl?: string;
}

export type LabLogSeverity = 'error' | 'success' | 'info';

export interface LabLogRow {
  time: string;
  type: string;
  data: string;
  severity?: LabLogSeverity;
}

export interface LabAggregate {
  ip: string;
  count: number;
}

export interface LabThreatField {
  label: string;
  value: string;
  valClass: string;
}

/** Curated SIEM-style exercise loaded from portfolio data (not a live Splunk instance). */
export interface LabScenario {
  id: string;
  title: string;
  headline: string;
  environmentLabel: string;
  statusLabel: string;
  query: string;
  highlightIp: string;
  threatSummary: LabThreatField[];
  rows: LabLogRow[];
  aggregates: LabAggregate[];
  toolboxQueries: string[];
}
