import type { GithubCommit } from '@/types';
import { site } from '@/data/site';

const GITHUB_API = 'https://api.github.com';
const USER_AGENT = 'cyber-portfolio';
const DEFAULT_LIMIT = 12;
/** This site's GitHub repository (owner/name). */
export const DEFAULT_PORTFOLIO_REPO = 'SaaeedK/Portfolio';

export const GITHUB_COMMITS_URL = '/data/github-commits.json';

export function githubUsernameFromUrl(url: string | undefined): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url.trim());
    if (!/github\.com$/i.test(parsed.hostname)) return null;
    const segment = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    return segment || null;
  } catch {
    return null;
  }
}

export function resolveGithubUsername(): string | null {
  const fromEnv = import.meta.env.VITE_GITHUB_USERNAME?.trim();
  if (fromEnv) return fromEnv;
  return githubUsernameFromUrl(site.githubUrl);
}

export function resolvePortfolioRepo(): string {
  const env = import.meta.env.VITE_GITHUB_REPO?.trim();
  if (env && /^[^/]+\/[^/]+$/.test(env)) return env;
  return DEFAULT_PORTFOLIO_REPO;
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

function formatCommitDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function splitMessage(message: string): { title: string; details: string[] } {
  const lines = message.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { title: '(no message)', details: [] };
  return { title: lines[0]!, details: lines.slice(1) };
}

type ApiCommit = {
  sha: string;
  html_url: string;
  commit: { message: string; author: { date: string } | null };
};

type ApiRepo = {
  full_name: string;
  html_url: string;
  default_branch?: string;
};

async function githubGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': USER_AGENT,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function mapApiCommit(raw: ApiCommit, repo: ApiRepo, branch?: string): GithubCommit {
  const { title, details } = splitMessage(raw.commit.message);
  const isoDate = raw.commit.author?.date ?? '';
  return {
    id: raw.sha,
    hash: shortSha(raw.sha),
    branch,
    message: title,
    repo: repo.full_name.split('/')[1] ?? repo.full_name,
    repoFullName: repo.full_name,
    repoUrl: repo.html_url,
    commitUrl: raw.html_url,
    details,
    date: formatCommitDate(isoDate),
    isoDate,
  };
}

/** Newest commit first; HEAD branch label only on the latest entry. */
export function sortAndAnnotateCommits(commits: GithubCommit[], defaultBranch = 'main'): GithubCommit[] {
  const sorted = [...commits].sort((a, b) => Date.parse(b.isoDate) - Date.parse(a.isoDate));
  if (sorted.length === 0) return sorted;
  const latestId = sorted[0]!.id;
  return sorted.map((c) => ({
    ...c,
    branch: c.id === latestId ? `HEAD -> ${defaultBranch}` : undefined,
  }));
}

export function getLatestCommitId(commits: GithubCommit[]): string | null {
  if (commits.length === 0) return null;
  let latest = commits[0]!;
  for (const c of commits) {
    if (Date.parse(c.isoDate) > Date.parse(latest.isoDate)) latest = c;
  }
  return latest.id;
}

/** Recent commits for this portfolio repository only. */
export async function fetchPortfolioCommits(
  repoFullName: string,
  limit = DEFAULT_LIMIT,
): Promise<GithubCommit[]> {
  const meta = await githubGet<ApiRepo>(`/repos/${repoFullName}`);
  const defaultBranch = meta?.default_branch ?? 'main';
  const repo: ApiRepo = meta ?? {
    full_name: repoFullName,
    html_url: `https://github.com/${repoFullName}`,
    default_branch: defaultBranch,
  };

  const batch =
    (await githubGet<ApiCommit[]>(`/repos/${repoFullName}/commits?per_page=${limit}`)) ?? [];

  const mapped = batch.map((raw) => mapApiCommit(raw, repo));
  return sortAndAnnotateCommits(mapped, defaultBranch);
}

export type GithubCommitsFile = {
  username: string;
  repo: string;
  fetchedAt: string;
  commits: GithubCommit[];
};

export async function loadGithubCommitsFile(): Promise<GithubCommitsFile | null> {
  try {
    const res = await fetch(GITHUB_COMMITS_URL, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = (await res.json()) as GithubCommitsFile;
    if (!data?.commits?.length) return null;
    return data;
  } catch {
    return null;
  }
}
