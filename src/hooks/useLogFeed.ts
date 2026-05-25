import { useCallback, useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle, GitCommit, Info, Shield } from 'lucide-react';

export interface LiveLogEntry {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  icon: LucideIcon;
  color: string;
}

type FeedStatus = 'connecting' | 'live' | 'fallback' | 'error';

const POLL_MS = 12_000;
const MAX_VISIBLE = 48;
const LOGS_API = '/api/logs';
const FALLBACK_URL = '/data/log-feed.json';

const TYPE_STYLE: Record<string, { icon: LucideIcon; color: string }> = {
  OK: { icon: CheckCircle, color: 'text-secondary-fixed' },
  COMMIT: { icon: GitCommit, color: 'text-primary-fixed' },
  WARNING: { icon: AlertTriangle, color: 'text-error-fixed' },
  INFO: { icon: Info, color: 'text-primary-fixed' },
};

function styleForType(type: string) {
  return TYPE_STYLE[type] ?? { icon: Shield, color: 'text-secondary-fixed' };
}

function toLiveEntry(raw: { id: string; timestamp: string; type: string; message: string }): LiveLogEntry {
  const style = styleForType(raw.type);
  return { ...raw, icon: style.icon, color: style.color };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export function useLogFeed() {
  const [entries, setEntries] = useState<LiveLogEntry[]>([]);
  const [status, setStatus] = useState<FeedStatus>('connecting');
  const [lastRefresh, setLastRefresh] = useState('');
  const seenIds = useRef(new Set<string>());
  const fallbackSlot = useRef(0);
  const apiLive = useRef(false);

  const appendEntries = useCallback((raw: { id: string; timestamp: string; type: string; message: string }[]) => {
    if (raw.length === 0) return;
    setEntries((prev) => {
      const next = [...prev];
      for (const item of raw) {
        if (seenIds.current.has(item.id)) continue;
        seenIds.current.add(item.id);
        next.push(toLiveEntry(item));
      }
      while (next.length > MAX_VISIBLE) {
        const removed = next.shift();
        if (removed) seenIds.current.delete(removed.id);
      }
      return next;
    });
    setLastRefresh(new Date().toLocaleTimeString());
  }, []);

  const pollFallback = useCallback(async () => {
    const pool = await fetchJson<{ id: string; type: string; message: string }[]>(FALLBACK_URL);
    if (!pool?.length) {
      setStatus('error');
      return;
    }
    setStatus('fallback');
    const slot = fallbackSlot.current++;
    const tpl = pool[slot % pool.length]!;
    appendEntries([
      {
        id: `${tpl.id}-local-${slot}`,
        type: tpl.type,
        message: tpl.message,
        timestamp: new Date().toISOString(),
      },
    ]);
  }, [appendEntries]);

  const poll = useCallback(async () => {
    const data = await fetchJson<{ entries?: { id: string; timestamp: string; type: string; message: string }[] }>(
      LOGS_API,
    );
    if (data?.entries?.length) {
      apiLive.current = true;
      setStatus('live');
      appendEntries(data.entries);
      return;
    }
    if (!apiLive.current) {
      await pollFallback();
    }
  }, [appendEntries, pollFallback]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const pool = await fetchJson<{ id: string; type: string; message: string }[]>(FALLBACK_URL);
      if (cancelled || !pool?.length) return;
      const seed = pool.slice(0, 6).map((tpl, i) => ({
        id: `${tpl.id}-seed-${i}`,
        type: tpl.type,
        message: tpl.message,
        timestamp: new Date(Date.now() - (pool.length - i) * 60_000).toISOString(),
      }));
      appendEntries(seed);
      setStatus('connecting');
    }

    void bootstrap().then(() => poll());
    const id = window.setInterval(() => void poll(), POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [appendEntries, poll]);

  return { entries, status, lastRefresh };
}
