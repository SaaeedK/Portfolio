/* eslint-env node */
/**
 * Creates CONTACT_RATE_LIMIT KV (if needed) and enables the binding in wrangler.toml.
 * Requires: wrangler logged in or CLOUDFLARE_API_TOKEN set.
 *
 *   npm run kv:enable
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const wranglerPath = path.join(root, 'wrangler.toml');

function extractNamespaceId(output) {
  const jsonMatch = output.match(/"id"\s*:\s*"([a-f0-9]+)"/i);
  if (jsonMatch) return jsonMatch[1];
  const lineMatch = output.match(/id\s*=\s*"([a-f0-9]+)"/i);
  if (lineMatch) return lineMatch[1];
  const hex = output.match(/\b([a-f0-9]{32})\b/i);
  return hex?.[1] ?? null;
}

let id = process.argv[2]?.trim();
if (!id) {
  console.log('Creating KV namespace CONTACT_RATE_LIMIT…');
  const out = execSync('npx wrangler kv namespace create CONTACT_RATE_LIMIT', {
    cwd: root,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  console.log(out);
  id = extractNamespaceId(out);
  if (!id) {
    console.error('Could not parse namespace id. Pass it manually: npm run kv:enable -- <id>');
    process.exit(1);
  }
}

let toml = fs.readFileSync(wranglerPath, 'utf8');
const block = `[[kv_namespaces]]
binding = "CONTACT_RATE_LIMIT"
id = "${id}"`;

if (toml.includes('binding = "CONTACT_RATE_LIMIT"')) {
  toml = toml.replace(
    /#?\s*\[\[kv_namespaces\]\]\s*\n#?\s*binding = "CONTACT_RATE_LIMIT"\s*\n#?\s*id = "[^"]*"/,
    block,
  );
} else {
  toml = `${toml.trimEnd()}\n\n${block}\n`;
}

fs.writeFileSync(wranglerPath, toml.endsWith('\n') ? toml : `${toml}\n`);
console.log(`Updated ${wranglerPath} with KV id ${id}`);
