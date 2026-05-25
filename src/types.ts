/** Shared domain types for portfolio content, GitHub feed, and lab sandbox data. */

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

/** Recent commit from the owner's public GitHub repositories. */
export interface GithubCommit {
  id: string;
  hash: string;
  branch?: string;
  message: string;
  repo: string;
  repoFullName: string;
  repoUrl: string;
  commitUrl: string;
  details: string[];
  date: string;
  isoDate: string;
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
  /** SPL-style label shown above aggregate bars (per lab). */
  aggregateLabel: string;
  /** Short guidance for recruiters trying the sandbox. */
  recruiterHint: string;
}
