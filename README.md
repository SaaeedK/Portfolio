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

Imports use the `@/*` alias (resolved to [`src/`](src/)) via [`vite.config.ts`](vite.config.ts) and [`tsconfig.json`](tsconfig.json).

## Editing content

- **Home labs / timeline / projects:** [`src/data/portfolio.ts`](src/data/portfolio.ts)
- **Site name and tagline:** [`src/data/site.ts`](src/data/site.ts) (display copy; URLs still come from env)
- **Lab mock (tables, queries):** [`src/data/labDemo.ts`](src/data/labDemo.ts)
- **Log feed samples:** [`src/data/logFeed.ts`](src/data/logFeed.ts)

## Deploy

Build static assets with `npm run build` and host the `dist/` folder on any static host (GitHub Pages, Cloudflare Pages, Netlify, Vercel, etc.). Set the same `VITE_*` values in your host’s build environment so links and mailto work in production.

## Security note

Do **not** put API secrets in `VITE_*` variables; they are exposed in the client bundle. This project does not ship a Gemini or other AI key in the browser.
