import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dest = path.join(root, 'public', 'data', 'github-commits.json');
const DEFAULT_REPO = 'SaaeedK/Portfolio';

const GITHUB_API = 'https://api.github.com';
const USER_AGENT = 'cyber-portfolio';
const DEFAULT_LIMIT = 12;

function readUsername() {
  const explicit = process.env.VITE_GITHUB_USERNAME?.trim() || process.env.GITHUB_USERNAME?.trim();
  if (explicit) return explicit;

  const url =
    process.env.VITE_GITHUB_URL?.trim() ||
    readWranglerVar('VITE_GITHUB_URL') ||
    'https://github.com/SaaeedK';

  try {
    const parsed = new URL(url);
    const segment = parsed.pathname.replace(/^\/+|\/+$/g, '').split('/')[0];
    return segment || null;
  } catch {
    return null;
  }
}

function readPortfolioRepo() {
  const explicit =
    process.env.VITE_GITHUB_REPO?.trim() || process.env.GITHUB_REPO?.trim() || readWranglerVar('VITE_GITHUB_REPO');
  if (explicit && /^[^/]+\/[^/]+$/.test(explicit)) return explicit;
  return DEFAULT_REPO;
}

function readWranglerVar(name) {
  try {
    const toml = fs.readFileSync(path.join(root, 'wrangler.toml'), 'utf8');
    const re = new RegExp(`^${name}\\s*=\\s*"([^"]+)"`, 'm');
    const m = toml.match(re);
    return m?.[1]?.trim() ?? null;
  } catch {
    return null;
  }
}

function shortSha(sha) {
  return sha.slice(0, 7);
}

function formatCommitDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function splitMessage(message) {
  const lines = message.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { title: '(no message)', details: [] };
  return { title: lines[0], details: lines.slice(1) };
}

async function githubGet(path) {
  const token = process.env.GITHUB_TOKEN?.trim();
  const headers = {
    Accept: 'application/vnd.github+json',
    'User-Agent': USER_AGENT,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${GITHUB_API}${path}`, { headers });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub ${res.status} ${path}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function mapApiCommit(raw, repo, branch) {
  const { title, details } = splitMessage(raw.commit.message);
  const isoDate = raw.commit.author?.date ?? '';
  const repoName = repo.full_name.split('/')[1] ?? repo.full_name;
  return {
    id: raw.sha,
    hash: shortSha(raw.sha),
    branch,
    message: title,
    repo: repoName,
    repoFullName: repo.full_name,
    repoUrl: repo.html_url,
    commitUrl: raw.html_url,
    details,
    date: formatCommitDate(isoDate),
    isoDate,
  };
}

function sortAndAnnotateCommits(commits, defaultBranch = 'main') {
  const sorted = [...commits].sort((a, b) => Date.parse(b.isoDate) - Date.parse(a.isoDate));
  if (sorted.length === 0) return sorted;
  const latestId = sorted[0].id;
  return sorted.map((c) => ({
    ...c,
    branch: c.id === latestId ? `HEAD -> ${defaultBranch}` : undefined,
  }));
}

async function fetchPortfolioCommits(repoFullName, limit = DEFAULT_LIMIT) {
  const meta = await githubGet(`/repos/${repoFullName}`);
  const defaultBranch = meta.default_branch ?? 'main';
  const batch = await githubGet(`/repos/${repoFullName}/commits?per_page=${limit}`);
  const mapped = batch.map((raw) => mapApiCommit(raw, meta));
  return sortAndAnnotateCommits(mapped, defaultBranch);
}

function writePayload(username, repo, commits) {
  const payload = {
    username,
    repo,
    fetchedAt: new Date().toISOString(),
    commits,
  };
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function main() {
  const username = readUsername();
  const repo = readPortfolioRepo();
  if (!username) {
    console.warn('sync-github-commits: no GitHub username; skipping.');
    return;
  }

  const hasToken = Boolean(process.env.GITHUB_TOKEN?.trim());

  let commits;
  try {
    commits = await fetchPortfolioCommits(repo);
  } catch (err) {
    const is404 = String(err.message).includes('404');
    console.warn(`sync-github-commits: ${err.message}`);
    if (is404 && !hasToken) {
      console.warn(
        `Ensure ${repo} exists and is public on GitHub, or set GITHUB_TOKEN (Pages Secret) while the repo is private.`,
      );
    } else if (!hasToken) {
      console.warn('Anonymous GitHub API failed — set GITHUB_TOKEN only if the repo stays private.');
    }
    if (fs.existsSync(dest)) {
      console.warn(`Keeping existing ${path.relative(root, dest)} from a previous sync.`);
      return;
    }
    writePayload(username, repo, []);
    console.warn('Wrote empty commit cache; run again after the repo is public or token is set.');
    return;
  }

  writePayload(username, repo, commits);
  console.log(`Synced ${commits.length} commits for ${repo} → ${path.relative(root, dest)}`);
}

main().catch((err) => {
  console.error('sync-github-commits failed:', err.message);
  process.exitCode = 1;
});
