#!/usr/bin/env node
// Builds garden.json: one "plant" per file in ProofGarden/ (theorems) and
// ProofGarden/Lemmas/ (helper lemmas), each marked proved or still growing.
//
// A plant counts as proved only when ALL of these hold:
//   1. `lake build` succeeded and reported no error in its file,
//   2. its file contains no `sorry` and declares no `axiom`,
//   3. `#print axioms` for each of its theorems lists only Lean's three
//      standard axioms (propext, Classical.choice, Quot.sound). This also
//      catches a proof that leans on an unproved helper lemma.
//
// Usage:
//   node scripts/garden.mjs              run lake build + axiom check, write garden.json
//   node scripts/garden.mjs --log FILE   use an existing `lake build` log instead of building
//
// Plain Node, no dependencies.

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_URL = 'https://github.com/Wenrwa/proof-garden';
const BRANCH = 'main';
const STANDARD_AXIOMS = new Set(['propext', 'Classical.choice', 'Quot.sound']);
const SKIP = new Set(['Defs.lean']);

const args = process.argv.slice(2);
const logArg = args.includes('--log') ? args[args.indexOf('--log') + 1] : null;

// ---------- scan sources ----------

function stripComments(src) {
  // Lean block comments nest; line comments run to end of line.
  let out = '', depth = 0;
  for (let i = 0; i < src.length; i++) {
    if (src.startsWith('/-', i)) { depth++; i++; continue; }
    if (depth > 0 && src.startsWith('-/', i)) { depth--; i++; continue; }
    if (depth > 0) continue;
    if (src.startsWith('--', i)) { while (i < src.length && src[i] !== '\n') i++; out += '\n'; continue; }
    out += src[i];
  }
  return out;
}

const clean = (s) => s.replace(/\s+/g, ' ').trim();

function parseFile(abs, kind) {
  const src = readFileSync(abs, 'utf8');
  const rel = relative(ROOT, abs).split('\\').join('/');
  const moduleDoc = (src.match(/\/-!([\s\S]*?)-\//) || [, ''])[1].trim();
  const titleMatch = moduleDoc.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : rel;
  const blurb = clean(moduleDoc.replace(/^#\s+.+$/m, ''));
  const decls = [];
  const re = /\/--([\s\S]*?)-\/\s*theorem\s+(\S+)([\s\S]*?):=/g;
  let m;
  while ((m = re.exec(src))) {
    decls.push({ name: `ProofGarden.${m[2]}`, doc: clean(m[1]), statement: clean(`theorem ${m[2]}${m[3]}`) });
  }
  const code = stripComments(src);
  const dependsOn = [...src.matchAll(/^import\s+ProofGarden\.Lemmas\.(\w+)/gm)].map((x) => `Lemmas/${x[1]}`);
  return {
    id: rel.replace(/^ProofGarden\//, '').replace(/\.lean$/, ''),
    kind, title, blurb, file: rel,
    url: `${REPO_URL}/blob/${BRANCH}/${rel}`,
    dependsOn, decls,
    hasSorry: /\bsorry\b/.test(code),
    hasAxiomDecl: /^\s*(private\s+)?axiom\s/m.test(code),
  };
}

const plants = [];
const thmDir = join(ROOT, 'ProofGarden');
for (const f of readdirSync(thmDir).sort()) {
  if (f.endsWith('.lean') && !SKIP.has(f)) plants.push(parseFile(join(thmDir, f), 'theorem'));
}
const lemDir = join(thmDir, 'Lemmas');
if (existsSync(lemDir)) {
  for (const f of readdirSync(lemDir).sort()) if (f.endsWith('.lean')) plants.push(parseFile(join(lemDir, f), 'lemma'));
}

// ---------- build ----------

function lake(argv) {
  const r = spawnSync('lake', argv, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
  if (r.error) return null; // lake not installed
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

let buildLog, buildOk;
if (logArg) {
  buildLog = readFileSync(logArg, 'utf8');
  buildOk = !/^\s*(error|✖)/m.test(buildLog) && !/build failed/i.test(buildLog);
} else {
  const r = lake(['build']);
  if (!r) {
    console.error('garden: `lake` not found; install the toolchain in lean-toolchain (elan) or pass --log FILE. garden.json left unchanged.');
    process.exit(0);
  }
  buildLog = r.out;
  buildOk = r.code === 0;
  writeFileSync(join(ROOT, 'build.log'), buildLog);
}

const erroredFiles = new Set();
const sorryWarnings = new Set();
for (const line of buildLog.split('\n')) {
  const f = line.match(/(ProofGarden\/[\w/]+\.lean)/);
  if (!f) continue;
  if (/\berror\b/.test(line)) erroredFiles.add(f[1]);
  if (/declaration uses [`']sorry[`']/.test(line)) sorryWarnings.add(f[1]);
}

// ---------- axioms ----------

const axiomsOf = new Map();
let axiomsChecked = false;
if (buildOk && !logArg) {
  const dir = join(ROOT, '.lake', 'garden');
  mkdirSync(dir, { recursive: true });
  const probe = join(dir, 'Axioms.lean');
  const names = plants.flatMap((p) => p.decls.map((d) => d.name));
  writeFileSync(probe, `import ProofGarden\n${names.map((n) => `#print axioms ${n}`).join('\n')}\n`);
  const r = lake(['env', 'lean', probe]);
  if (r && r.code === 0) {
    axiomsChecked = true;
    for (const n of names) axiomsOf.set(n, []);
    for (const m of r.out.matchAll(/'([\w.]+)' depends on axioms: \[([^\]]*)\]/g)) {
      axiomsOf.set(m[1], m[2].split(',').map((s) => s.trim()).filter(Boolean));
    }
  } else if (r) {
    console.error('garden: axiom check failed:\n' + r.out);
  }
}

// ---------- verdicts ----------

for (const p of plants) {
  const reasons = [];
  if (!buildOk) reasons.push('build failed');
  if (erroredFiles.has(p.file)) reasons.push('file has errors');
  if (p.hasSorry || sorryWarnings.has(p.file)) reasons.push('contains sorry');
  if (p.hasAxiomDecl) reasons.push('declares an axiom');
  if (!axiomsChecked) reasons.push('axioms not checked');
  for (const d of p.decls) {
    d.axioms = axiomsOf.get(d.name) ?? null;
    const extra = (d.axioms || []).filter((a) => !STANDARD_AXIOMS.has(a));
    if (extra.length && !p.hasSorry) {
      reasons.push(extra.includes('sorryAx') ? `${d.name.split('.').pop()} relies on an unproved lemma` : `uses axiom ${extra.join(', ')}`);
    }
  }
  if (p.decls.length === 0) reasons.push('no theorem found');
  p.status = reasons.length === 0 ? 'proved' : 'growing';
  p.reason = [...new Set(reasons)].join('; ') || null;
  delete p.hasSorry; delete p.hasAxiomDecl;
}

const theorems = plants.filter((p) => p.kind === 'theorem');
const garden = {
  generatedAt: new Date().toISOString(),
  toolchain: readFileSync(join(ROOT, 'lean-toolchain'), 'utf8').trim(),
  repo: REPO_URL,
  build: { ok: buildOk, axiomsChecked },
  proved: theorems.filter((p) => p.status === 'proved').length,
  total: theorems.length,
  lemmas: { proved: plants.filter((p) => p.kind === 'lemma' && p.status === 'proved').length, total: plants.length - theorems.length },
  plants,
};
writeFileSync(join(ROOT, 'garden.json'), JSON.stringify(garden, null, 2) + '\n');
console.log(`garden: ${garden.proved} of ${garden.total} theorems proved (${garden.lemmas.proved} of ${garden.lemmas.total} lemmas); build ${buildOk ? 'ok' : 'FAILED'}`);
