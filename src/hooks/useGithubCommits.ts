import { useEffect, useMemo, useState } from 'react';
import {
  fetchPortfolioCommits,
  getLatestCommitId,
  loadGithubCommitsFile,
  resolveGithubUsername,
  resolvePortfolioRepo,
  sortAndAnnotateCommits,
} from '@/lib/githubCommits';
import type { GithubCommit } from '@/types';

export type GithubCommitsStatus = 'loading' | 'ready' | 'error';

export function useGithubCommits() {
  const [commits, setCommits] = useState<GithubCommit[]>([]);
  const [status, setStatus] = useState<GithubCommitsStatus>('loading');
  const [source, setSource] = useState<'static' | 'live' | null>(null);
  const repo = resolvePortfolioRepo();

  const latestCommitId = useMemo(() => getLatestCommitId(commits), [commits]);

  useEffect(() => {
    let cancelled = false;
    const username = resolveGithubUsername();

    async function load() {
      if (!username) {
        if (!cancelled) {
          setCommits([]);
          setStatus('error');
          setSource(null);
        }
        return;
      }

      const cached = await loadGithubCommitsFile();
      if (cancelled) return;

      if (cached?.commits?.length && cached.username.toLowerCase() === username.toLowerCase()) {
        const forRepo = cached.commits.filter(
          (c) => c.repoFullName.toLowerCase() === repo.toLowerCase(),
        );
        if (forRepo.length > 0 && (!cached.repo || cached.repo === repo)) {
          setCommits(sortAndAnnotateCommits(forRepo));
          setStatus('ready');
          setSource('static');
          return;
        }
      }

      const live = await fetchPortfolioCommits(repo);
      if (cancelled) return;

      if (live.length > 0) {
        setCommits(live);
        setStatus('ready');
        setSource('live');
      } else {
        setCommits([]);
        setStatus('error');
        setSource(null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [repo]);

  return { commits, status, source, repo, latestCommitId };
}
