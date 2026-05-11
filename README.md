# Cyber portfolio (Vite + React)

Terminal-inspired portfolio UI: dashboard, Splunk-style **static demo** lab, decorative log stream, and a contact form that opens the visitor’s mail client (`mailto:`) when `VITE_EMAIL` is set.

## Prerequisites

- Node.js 20+ recommended

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy [`.env.example`](.env.example) to `.env.local` and set any links you want (GitHub, LinkedIn, email, résumé URL). All variables are optional; unset URLs show helpful placeholders in the UI.

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

**2. Production and preview environment variables**

In the Pages project → **Settings** → **Environment variables**, add the same keys as [`.env.example`](.env.example) for **Production** (and **Preview** if you want PR previews):

- `VITE_GITHUB_URL`, `VITE_LINKEDIN_URL`, `VITE_EMAIL`, `VITE_RESUME_URL`
- Optional Firebase: `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`, `VITE_FIREBASE_MEASUREMENT_ID`

Trigger **Retry deployment** after changing variables (Vite inlines `VITE_*` at build time).

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
