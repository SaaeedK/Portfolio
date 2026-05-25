import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const src = path.join(root, 'src', 'data', 'lab-scenarios.json');
const dest = path.join(root, 'public', 'data', 'lab-scenarios.json');

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(src, dest);
console.log(`Synced ${path.relative(root, src)} → ${path.relative(root, dest)}`);
