import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

function checkDirectory(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) checkDirectory(path);
    else if (/\.(?:js|mjs)$/.test(path)) {
      execFileSync(process.execPath, ['--check', path], { stdio: 'inherit' });
    }
  }
}

checkDirectory('src');
const html = readFileSync('index.html', 'utf8');
for (const [, path] of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) {
  if (!existsSync(path)) throw new Error('Missing asset: ' + path);
}
console.log('Source syntax and local assets checked.');
