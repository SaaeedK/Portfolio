# Cyber portfolio (Vite + React)

Terminal-inspired portfolio UI: dashboard, Splunk-style **static demo** lab, decorative log stream, and a **Contact** page with profiles plus a résumé link that **opens the PDF in a new tab** (no public email in env — contact details live in your PDF).

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

   App defaults to port `3000` (see [`package.json`](package.json)).

## Scripts

| Script        | Description                          |
| ------------- | ------------------------------------ |
| `npm run dev` | Vite dev server                      |
| `npm run build` | Production bundle to `dist/`     |
| `npm run preview` | Serve `dist/` locally            |
| `npm run lint` | `tsc --noEmit` + ESLint            |
| `npm run clean` | Remove `dist/` (cross-platform)  |

## Project structure

| Path | Role |
| ---- | ---- |
| [`src/App.tsx`](src/App.tsx) | Root shell: router + layout wrapper |
| [`src/routes.tsx`](src/routes.tsx) | Declarative `<Routes>` / `<Route>` table |
| [`src/layout/`](src/layout/) | `Shell`, `TopNav`, `SideNav` (site chrome) |
| [`src/pages/`](src/pages/) | Route-level screens only |
| [`src/data/`](src/data/) | Content modules and [`src/data/index.ts`](src/data/index.ts) barrel |
| [`src/lib/`](src/lib/) | Shared utilities (`cn`, etc.) |
| [`src/types.ts`](src/types.ts) | Shared TypeScript interfaces |
| [`public/`](public/) | Static assets copied to `dist/` (e.g. [`public/_redirects`](public/_redirects) for SPA routing on Cloudflare Pages) |
| [`firebase.json`](firebase.json), [`firestore.rules`](firestore.rules) | Firebase CLI: Firestore rules deploy (optional) |

Imports use the `@/*` alias (resolved to [`src/`](src/)) via [`vite.config.ts`](vite.config.ts) and [`tsconfig.json`](tsconfig.json).

## Résumé on this site

- Default résumé URL is **`/resume.pdf`** (links use **`target="_blank"`** so the PDF opens in a new tab). Put your file at **`public/resume.pdf`** in the repo; Vite copies it into `dist/resume.pdf` on build.
- To use another path or an external PDF instead, set **`VITE_RESUME_URL`** to e.g. `/cv.pdf` or `https://...`.

## Editing content

- **Home labs / timeline / projects:** [`src/data/portfolio.ts`](src/data/portfolio.ts)
- **Site name and tagline:** [`src/data/site.ts`](src/data/site.ts) (display copy; URLs still come from env)
- **Lab mock (tables, queries):** [`src/data/labDemo.ts`](src/data/labDemo.ts)
- **Log feed samples:** [`src/data/logFeed.ts`](src/data/logFeed.ts)

## Deploy

### Cloudflare Pages (recommended)

Repo includes [`.node-version`](.node-version) (Node 20) for consistent CI/Pages builds, and [`public/_redirects`](public/_redirects) so client-side routes (`/labs`, `/logs`, `/comms`) resolve on refresh.

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
2. In Pages → **Settings** → **Variables and Secrets** → **Secrets**, add:
   - `RESEND_API_KEY`
   - `TURNSTILE_SECRET`
   - `CONTACT_TO_EMAIL` (your inbox — keep out of git)
3. Commit and push (or **Retry deployment**) so build + Functions pick up changes.

Optional Firebase `VITE_FIREBASE_*` can also go in `[vars]` if you use Analytics. KV: uncomment `[[kv_namespaces]]` in `wrangler.toml` after creating a namespace.

**3. Custom domain (optional)**

Pages project → **Custom domains** → add your domain and apply the DNS records Cloudflare shows (often a CNAME to your `*.pages.dev` host). Use **Full (strict)** SSL once DNS propagates.

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
