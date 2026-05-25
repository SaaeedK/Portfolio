/**
 * Cloudflare Pages Function: GET /api/logs
 * Read-only curated tail: no user input, no SQL — rotates portfolio sample lines with fresh timestamps.
 */

import { jsonResponse } from '../lib/responseHeaders';

export interface Env {
  ALLOWED_ORIGINS?: string;
  CONTACT_RATE_LIMIT?: KVNamespace;
}

type FeedTemplate = { id: string; type: string; message: string };

const RL_MAX_PER_MINUTE = 30;
const RATE_MINUTE_MS = 60_000;

function checkOrigin(request: Request, env: Env): Response | null {
  const raw = env.ALLOWED_ORIGINS?.trim();
  if (!raw) return null;
  const allowed = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const origin = request.headers.get('Origin');
  if (!origin || !allowed.has(origin)) {
    return jsonResponse(403, { error: 'origin_not_allowed' });
  }
  return null;
}

function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ??
    request.headers.get('X-Real-IP') ??
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'unknown'
  );
}

async function bumpRateWindow(kv: KVNamespace, ip: string, max: number): Promise<boolean> {
  const windowIndex = Math.floor(Date.now() / RATE_MINUTE_MS);
  const key = `logs:m:${ip}:${windowIndex}`;
  const current = parseInt((await kv.get(key)) || '0', 10);
  if (current >= max) return false;
  await kv.put(key, String(current + 1), { expirationTtl: 90 });
  return true;
}

async function loadPool(request: Request): Promise<FeedTemplate[]> {
  const url = new URL('/data/log-feed.json', request.url);
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) return [];
  return data.filter(
    (e): e is FeedTemplate =>
      e &&
      typeof e === 'object' &&
      typeof (e as FeedTemplate).id === 'string' &&
      typeof (e as FeedTemplate).type === 'string' &&
      typeof (e as FeedTemplate).message === 'string',
  );
}

export async function onRequestGet(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  const originBlock = checkOrigin(request, env);
  if (originBlock) return originBlock;

  const ip = clientIp(request);
  const kv = env.CONTACT_RATE_LIMIT;
  if (kv && !(await bumpRateWindow(kv, ip, RL_MAX_PER_MINUTE))) {
    return jsonResponse(429, { error: 'rate_limited' });
  }

  const pool = await loadPool(request);
  if (pool.length === 0) {
    return jsonResponse(503, { error: 'log_feed_unavailable' });
  }

  const slot = Math.floor(Date.now() / 12_000);
  const count = Math.min(2, pool.length);
  const entries = Array.from({ length: count }, (_, i) => {
    const tpl = pool[(slot + i) % pool.length]!;
    return {
      id: `${tpl.id}-${slot}-${i}`,
      type: tpl.type,
      message: tpl.message,
      timestamp: new Date().toISOString(),
    };
  });

  return jsonResponse(200, {
    ok: true,
    entries,
    polledAt: new Date().toISOString(),
    source: 'portfolio_curated',
  });
}
