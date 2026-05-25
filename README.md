# Cyber portfolio (Vite + React)

Terminal-inspired portfolio UI: dashboard, Splunk-style **lab exercises** (JSON-backed), decorative log stream, and a **Contact** page with profiles plus a résumé link that **opens the PDF in a new tab** (no public email in env — contact details live in your PDF).

## Prerequisites

- Node.js 20+ recommended

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy [`.env.example`](.env.example) to `.env.local` and set profile links or a **`VITE_RESUME_URL`** override if needed. Add **`public/resume.pdf`** so the default **`/resume.pdf`** link works after build (see **Résumé on this site**). All `VITE_*` entries are optional.

3. Run locally:

   ```bash
   npm run dev
   ```

   App defaults to port `3000` on `127.0.0.1` (see [`package.json`](package.json)). For LAN testing: `npx vite --host 0.0.0.0 --port 3000`.

## Scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `npm run dev` | Vite dev server                      |
| `npm run build` | Production bundle to `dist/`     |
| `npm run preview` | Serve `dist/` locally            |
| `npm run lint` | `tsc --noEmit` + ESLint            |
| `npm test` | Vitest unit tests (`secureInput`, `splQuery`) |
| `npm run security:check` | `npm audit` (high+); CI also runs [gitleaks](.gitleaks.toml) |
| `npm run clean` | Remove `dist/` (cross-platform)  |

## Project structure

| Path | Role |
| ---- | ---- |
| [`src/App.tsx`](src/App.tsx) | Root shell: router + layout wrapper |
| [`src/routes.tsx`](src/routes.tsx) | Declarative `<Routes>` / `<Route>` table |
| [`src/layout/`](src/layout/) | `Shell`, `TopNav`, `SideNav` (site chrome) |
| [`src/pages/`](src/pages/) | Route-level screens only |
| [`src/data/`](src/data/) | Site copy, portfolio cards, lab JSON, log sidebar labels |
| [`src/lib/`](src/lib/) | Shared utilities (`cn`, etc.) |
| [`src/types.ts`](src/types.ts) | Shared TypeScript interfaces |
| [`public/`](public/) | Static assets copied to `dist/` (e.g. [`public/_redirects`](public/_redirects) for SPA routing on Cloudflare Pages) |
| [`firebase.json`](firebase.json), [`firestore.rules`](firestore.rules) | Firebase CLI: Firestore rules deploy (optional) |

Imports use the `@/*` alias (resolved to [`src/`](src/)) via [`vite.config.ts`](vite.config.ts) and [`tsconfig.json`](tsconfig.json).

## Résumé on this site

- Default résumé URL is **`/resume.pdf`** (header **Résumé** button; footer has a plain text link). Links use **`target="_blank"`**.
- **`public/resume.pdf` must be a real binary PDF** (starts with `%PDF-`), not a text file — otherwise browsers show “can’t open this file.” Use a **redacted** export: no email, phone, or street address in the file; reachability via **`/comms`** and LinkedIn.
- Regenerate from source with `node scripts/generate-resume-pdf.mjs` (uses `pdf-lib`; content lives in that script), or replace the file with your own redacted export.
- To use another path or an external PDF, set **`VITE_RESUME_URL`** to e.g. `/cv.pdf` or `https://...`.

## Editing content

- **Home labs / timeline / projects:** [`src/data/portfolio.ts`](src/data/portfolio.ts)
- **Site name and tagline:** [`src/data/site.ts`](src/data/site.ts) (display copy; URLs still come from env)
- **Lab exercises (SIEM-style tables, queries):** edit [`src/data/lab-scenarios.json`](src/data/lab-scenarios.json) (bundled at build via [`src/data/labScenarios.ts`](src/data/labScenarios.ts)). Restart dev or rebuild after changes; SPL runs in the browser ([`src/lib/splQuery.ts`](src/lib/splQuery.ts), [`src/lib/secureInput.ts`](src/lib/secureInput.ts))
- **Live log tail pool:** [`public/data/log-feed.json`](public/data/log-feed.json) — polled via [`GET /api/logs`](functions/api/logs.ts) on `/logs` (read-only, rate-limited)
- **Static log sidebar labels:** [`src/data/logFeed.ts`](src/data/logFeed.ts)

## Deploy

### Cloudflare Pages (recommended)

Repo includes [`.node-version`](.node-version) (Node 20) for consistent CI/Pages builds, [`public/_redirects`](public/_redirects) for SPA routing, and [`public/_headers`](public/_headers) for CSP, HSTS, and related hardening on Cloudflare Pages.

**1. Connect the repository (dashboard)**

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Authorize GitHub and select this repository.
3. **Build settings:**
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/` (repository root)
4. Save and deploy the first build.

**2. Environment variables (wrangler.toml + dashboard Secrets)**

This repo sets `pages_build_output_dir` in [`wrangler.toml`](wrangler.toml), so Cloudflare manages **plaintext** variables from that file—not from the dashboard **Variables** form (you will see: *“Only Secrets can be managed via the Dashboard”*).

1. Edit [`wrangler.toml`](wrangler.toml) `[vars]`: `ALLOWED_ORIGINS`, `VITE_TURNSTILE_SITE_KEY`, optional `VITE_GITHUB_URL` / `VITE_LINKEDIN_URL`, etc.
2. In Pages → **Settings** → **Variables and Secrets** → **Secrets**, add (dashboard only — not `wrangler.toml` `[vars]`):
   - `RESEND_API_KEY`
   - `TURNSTILE_SECRET`
   - `CONTACT_TO_EMAIL` (your inbox — keep out of git)
   - `GITHUB_TOKEN` — **optional**; only if the repo stays **private**. When `SaaeedK/Portfolio` is **public**, omit it — `npm run build` syncs commits via the public GitHub API.
3. Commit and push (or **Retry deployment**) so build + Functions pick up changes.

**Commit history on the dashboard:** `VITE_GITHUB_REPO` in [`wrangler.toml`](wrangler.toml) `[vars]`. [`public/data/github-commits.json`](public/data/github-commits.json) is **gitignored** and regenerated on each `npm run build` / Pages deploy.

Optional Firebase `VITE_FIREBASE_*` can also go in `[vars]` if you use Analytics.

**Contact API rate limits (KV, recommended)**

After `wrangler login` (or with `CLOUDFLARE_API_TOKEN` set):

```bash
npm run kv:enable
```

This creates the `CONTACT_RATE_LIMIT` namespace and writes its id into `wrangler.toml`. Commit and redeploy. Manual alternative: `npm run kv:create`, then uncomment `[[kv_namespaces]]` in `wrangler.toml` and paste the id.

**3. Custom domain (optional)**

1. Pages project → **Custom domains** → add your domain and apply the DNS records Cloudflare shows (often a CNAME to your `*.pages.dev` host). Use **Full (strict)** SSL once DNS propagates.
2. Append the origin to `ALLOWED_ORIGINS` in [`wrangler.toml`](wrangler.toml) (comma-separated, **no trailing slashes**), e.g. `https://portfolio-6v0.pages.dev,https://www.yourdomain.com`, then commit and redeploy so **POST /api/contact** accepts requests from the new host (`GET /api/logs` is read-only and does not use origin allowlisting).

**Local dev with Functions:** run `npm run pages:dev` in one terminal and `npm run dev` in another (Vite proxies `/api/contact` and `/api/logs` to port 8788).

### Firebase (optional services alongside Pages)

Use **Cloudflare Pages for hosting** only; use Firebase for Auth, Firestore, Analytics, etc. Avoid running **Firebase Hosting** for the same production URL unless you intend to manage two origins.

**1. Create a project and web app**

1. [Firebase Console](https://console.firebase.google.com/) → **Add project** → note the **Project ID**.
2. **Project settings** (gear) → **Your apps** → **Web** (`</>`) → register the app → copy the `firebaseConfig` object values into `.env.local` / Cloudflare **Environment variables** using the `VITE_FIREBASE_*` names in [`.env.example`](.env.example).

**2. Client bootstrap in this repo**

[`src/lib/firebase.ts`](src/lib/firebase.ts) is loaded dynamically from [`src/main.tsx`](src/main.tsx) only when `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, and `VITE_FIREBASE_APP_ID` are set at **build** time, so installs without Firebase stay smaller. If any of those are missing, Firebase is not loaded.

**3. Firestore rules (deny-by-default)**

This repo ships [`firestore.rules`](firestore.rules) (deny all reads/writes) and [`firebase.json`](firebase.json). To deploy rules after you enable Firestore in the console:

1. Install [Firebase CLI](https://firebase.google.com/docs/cli): `npm install -g firebase-tools`
2. `firebase login`
3. Copy [`.firebaserc.example`](.firebaserc.example) to `.firebaserc` (gitignored), set your real `YOUR_FIREBASE_PROJECT_ID`.
4. `firebase deploy --only firestore:rules`

**4. Auth authorized domains**

If you use Firebase Auth: **Authentication** → **Settings** → **Authorized domains** → add your Cloudflare Pages hostname (`*.pages.dev` and any custom domain).

**5. App Check**

If you later allow public writes to Firestore or use callable functions, enable [App Check](https://firebase.google.com/docs/app-check) (e.g. reCAPTCHA v3 or Turnstile) to reduce abuse.

### Other static hosts

Any host that serves `dist/` can work; add the same SPA fallback rule your provider expects (this repo’s `public/_redirects` is Cloudflare/Netlify-style).

## Security note

Do **not** put API secrets in `VITE_*` variables; they are exposed in the client bundle. The Firebase Web **API key** and related `VITE_FIREBASE_*` fields are intended to be public; protect data with **Firestore/Storage security rules**, **Auth**, and **App Check**, not by hiding those values. This project does not ship server-only Gemini keys in the browser.

**Hardening in this repo**

- [`public/_headers`](public/_headers) — CSP (Turnstile + optional Firebase Analytics; `font-src` includes `data:` for widget-embedded fonts), `frame-ancestors 'none'`, HSTS, `Referrer-Policy`, `Permissions-Policy`.
- [`functions/api/contact.ts`](functions/api/contact.ts) — KV rate limits run after field validation and before Turnstile/MX/Resend (cheap rejection before external calls).
- [`functions/lib/responseHeaders.ts`](functions/lib/responseHeaders.ts) — shared `nosniff`, `no-store`, `X-Frame-Options`, `Referrer-Policy` on API JSON responses.
- CI runs [`npm run security:check`](scripts/security-check.mjs) and [gitleaks-action](.github/workflows/ci.yml) with [`.gitleaks.toml`](.gitleaks.toml).

**Production checklist:** Pages Secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO_EMAIL`), KV binding `CONTACT_RATE_LIMIT`, `ALLOWED_ORIGINS` includes every live hostname, optional zone WAF rate limit on `POST /api/contact`. **`GITHUB_TOKEN` not required** when the GitHub repo is public.

**Before making this repository public**

1. Run `npm run security:check` locally (same gate as CI).
2. Confirm no `.env`, `.env.local`, or `.dev.vars` files are tracked; only [`.env.example`](.env.example) should be in git. Do not commit `dist/`, `node_modules/`, or generated `public/data/github-commits.json` (see [`.gitignore`](.gitignore); `npm run security:check` enforces this).
3. [`public/resume.pdf`](public/resume.pdf) contains **name, employers, and locations** (no email/phone) — intentional public professional data.
4. [`wrangler.toml`](wrangler.toml) exposes **Turnstile site key** (public), **Pages URL**, **KV namespace id**, and profile links — not Resend/Turnstile secrets.
5. Keep `RESEND_API_KEY`, `TURNSTILE_SECRET`, and `CONTACT_TO_EMAIL` in **Cloudflare Pages Secrets only**.
6. **Remove `GITHUB_TOKEN`** from Pages Secrets after the repo is public (optional cleanup).
7. Rotate any PAT that was ever committed or pasted into a file, even if later removed from history.
8. Enable GitHub **Secret scanning** on the repository after it is public.
