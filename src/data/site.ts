/**
 * Public site copy and optional links (set in `.env.local` with VITE_* vars).
 */
export const site = {
  displayName: 'Saaeed Khan',
  displayHandle: 'SAAEED_K',
  /** Configure via VITE_GITHUB_URL, etc. */
  githubUrl: import.meta.env.VITE_GITHUB_URL as string | undefined,
  linkedinUrl: import.meta.env.VITE_LINKEDIN_URL as string | undefined,
  /** Optional override: full `https://...` URL or same-site path e.g. `/cv.pdf`. */
  resumeUrl: import.meta.env.VITE_RESUME_URL as string | undefined,
} as const;

export function externalHref(url: string | undefined, fallback = '#'): string {
  if (url && /^https?:\/\//i.test(url.trim())) return url.trim();
  if (url && url.startsWith('mailto:')) return url.trim();
  return fallback;
}

const defaultResumePath = '/resume.pdf';

/**
 * Résumé URL for links: uses `VITE_RESUME_URL` when set (https or absolute path),
 * otherwise same-origin `/resume.pdf` (from `public/resume.pdf` at build time).
 */
export function getResumeHref(): string {
  const raw = site.resumeUrl?.trim();
  if (!raw) return defaultResumePath;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (raw.startsWith('/')) return raw;
  return defaultResumePath;
}
