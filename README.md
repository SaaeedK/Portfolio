# Portfolio

Terminal-inspired security portfolio built with React and Vite. Includes a dashboard, Splunk-style lab exercises, a log stream, and a contact form backed by Cloudflare Pages Functions.

**Live:** [portfolio-6v0.pages.dev](https://portfolio-6v0.pages.dev)

## Stack

React 19 · TypeScript · Vite · Tailwind CSS · Cloudflare Pages (Functions + KV)

## Local development

**Requirements:** Node.js 20+

```bash
npm install
cp .env.example .env.local   # optional — profile links, Turnstile, Firebase
npm run dev
```

Dev server: `http://127.0.0.1:3000`. Contact API locally: run `npm run pages:dev` in a second terminal (Vite proxies `/api/*` to Wrangler).

| Command | Purpose |
| --- | --- |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Serve `dist/` locally |
| `npm run lint` | Typecheck + ESLint |
| `npm test` | Vitest unit tests |
| `npm run security:check` | Dependency audit + repo hygiene |

## Content

| Area | Location |
| --- | --- |
| Site copy & profile URLs | `src/data/site.ts`, `.env.local` |
| Labs, projects, timeline | `src/data/portfolio.ts` |
| Lab scenarios (SPL) | `src/data/lab-scenarios.json` |
| Résumé (default `/resume.pdf`) | `public/resume.pdf` |

## Deploy

Hosted on **Cloudflare Pages**: build `npm run build`, output `dist`. Configure `[vars]` in `wrangler.toml` and set server secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO_EMAIL`) in the Pages dashboard. See `.env.example` for variable names.

Do not put secrets in `VITE_*` — those are embedded in the client bundle.

## Author

**Saaeed Khan** — [GitHub](https://github.com/SaaeedK) · [LinkedIn](https://linkedin.com/in/saaeed-khan)
