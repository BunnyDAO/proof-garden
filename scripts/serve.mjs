#!/usr/bin/env node
// Tiny static server for the garden page: site/ is the web root and
// /garden.json is served from the repo root. Plain Node, no dependencies.
// PORT env overrides the default 3000 (HiveOp Preview uses .hiveop/dev.json).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, dirname, normalize, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(ROOT, 'site');
const PORT = Number(process.env.PORT) || 3000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path === '/garden.json' ? join(ROOT, 'garden.json')
    : join(SITE, normalize(path === '/' ? '/index.html' : path));
  if (!file.startsWith(SITE) && file !== join(ROOT, 'garden.json')) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('not found');
  }
}).listen(PORT, '0.0.0.0', () => console.log(`proof garden on http://localhost:${PORT}`));
