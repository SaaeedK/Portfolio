/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_URL?: string;
  /** Optional override; defaults to login parsed from VITE_GITHUB_URL. */
  readonly VITE_GITHUB_USERNAME?: string;
  /** Portfolio repo as owner/name (default SaaeedK/Portfolio). */
  readonly VITE_GITHUB_REPO?: string;
  readonly VITE_LINKEDIN_URL?: string;
  readonly VITE_RESUME_URL?: string;
  /** Firebase Web SDK (safe to expose in client). Omit to skip Firebase init. */
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_MEASUREMENT_ID?: string;
  /** Cloudflare Turnstile site key (public). Pair with server `TURNSTILE_SECRET` on Pages. */
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  /** Override contact POST URL (default `/api/contact`). */
  readonly VITE_CONTACT_API_URL?: string;
  /**
   * Dev only: `wrangler pages dev` bind address (see `.env.example`). Vite proxies `/api/contact` here.
   */
  readonly VITE_DEV_CONTACT_API_PROXY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
