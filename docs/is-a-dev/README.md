# Register `saaeedk.is-a.dev`

Copy [`saaeedk.json`](saaeedk.json) into the [is-a-dev/register](https://github.com/is-a-dev/register) repo as `domains/saaeedk.json` (template only — replace `YOUR_REAL_EMAIL` with a personal or professional address; **GitHub `@users.noreply.github.com` emails are rejected by CI**).

## 1. Cloudflare Pages custom domain

1. [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → project **cyber-portfolio** (or your Pages project).
2. **Custom domains** → **Add a custom domain** (not “Set up a custom domain on Cloudflare” / NS transfer).
3. Enter: `saaeedk.is-a.dev`
4. Wait for SSL to show active (can take a few minutes after DNS is live).

Guide: [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/).

## 2. is-a.dev pull request

1. [Fork `is-a-dev/register`](https://github.com/is-a-dev/register/fork).
2. Add `domains/saaeedk.json` with the contents of [`saaeedk.json`](saaeedk.json).
3. Open a PR; fill the template (reachable site, ToS, non-commercial portfolio).
4. After merge, DNS usually propagates within minutes.

## 3. This repo (after PR merges)

`wrangler.toml` already includes `https://saaeedk.is-a.dev` in `ALLOWED_ORIGINS` so **POST /api/contact** works on the new host. Commit and redeploy Pages if you change origins later.

Optional: add `https://saaeedk.is-a.dev` to the README **Live** link.
