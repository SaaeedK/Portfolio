/**
 * Public site copy and optional links (set in `.env.local` with VITE_* vars).
 */
export const site = {
  displayName: 'Alex Architect',
  displayHandle: 'ALEX_ARCHITECT',
  /** Shown in meta / OG tags */
  tagline: 'Security engineer portfolio — terminal-inspired UI, static demo content.',
  /** Configure via VITE_GITHUB_URL, etc. */
  githubUrl: import.meta.env.VITE_GITHUB_URL as string | undefined,
  linkedinUrl: import.meta.env.VITE_LINKEDIN_URL as string | undefined,
  email: import.meta.env.VITE_EMAIL as string | undefined,
  resumeUrl: import.meta.env.VITE_RESUME_URL as string | undefined,
} as const;

export function externalHref(url: string | undefined, fallback = '#'): string {
  if (url && /^https?:\/\//i.test(url.trim())) return url.trim();
  if (url && url.startsWith('mailto:')) return url.trim();
  return fallback;
}
