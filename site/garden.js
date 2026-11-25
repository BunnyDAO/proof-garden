// Renders garden.json as a grid of plants. No framework, no build step.
(async function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  let g;
  try {
    // Local server: /garden.json beside the page. GitHub Pages (repo root):
    // the page is /site/, the data one level up.
    let res = await fetch('garden.json', { cache: 'no-store' });
    if (!res.ok) res = await fetch('../garden.json', { cache: 'no-store' });
    g = await res.json();
  } catch (e) {
    $('count').innerHTML = '<span class="error">Could not load garden.json. Run node scripts/garden.mjs.</span>';
    return;
  }

  const pct = g.total ? Math.round((g.proved / g.total) * 100) : 0;
  $('count').innerHTML = `<b>${g.proved}</b> of ${g.total} proved`;
  $('meta').textContent = `${g.toolchain.replace('leanprover/lean4:', 'Lean ')} · build ${g.build.ok ? 'ok' : 'failing'} · ${new Date(g.generatedAt).toLocaleString()}`;
  const bar = $('bar');
  bar.setAttribute('aria-valuemax', g.total);
  bar.setAttribute('aria-valuenow', g.proved);
  requestAnimationFrame(() => { bar.firstElementChild.style.width = Math.max(pct, g.proved ? 2 : 0) + '%'; });
  $('thm-count').textContent = `${pct}% in bloom`;
  if (g.repo) $('repo').href = g.repo;

  const prose = (s) => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>');
  for (const p of g.plants) p.title = p.title.replace(/^Lemma:\s*/i, '');
  const titleOf = new Map(g.plants.map((p) => [p.id, p.title]));

  function card(p) {
    const proved = p.status === 'proved';
    const d = p.decls[0] || {};
    const statement = p.decls.map((x) => x.statement).join('\n\n');
    const needs = p.dependsOn?.length ? 'needs ' + p.dependsOn.map((id) => titleOf.get(id) || id).join(', ') : '';
    return `<article class="card ${proved ? 'proved' : 'growing'}">
      <div class="card-top">
        <div class="pot" aria-hidden="true">${proved ? '✓' : '⏳'}</div>
        <div>
          <div class="title">${prose(p.title)}</div>
          <div class="status" title="${esc(p.reason || '')}">${proved ? 'Proved' : 'Growing'}</div>
        </div>
      </div>
      <p class="blurb">${prose(p.kind === 'lemma' ? (d.doc || p.blurb) : p.blurb)}</p>
      ${p.kind === 'theorem' ? `<pre class="stmt">${esc(statement)}</pre>` : ''}
      <div class="foot">
        <span class="needs">${esc(needs)}</span>
        <a class="file" href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.file.replace(/^ProofGarden\//, ''))} ↗</a>
      </div>
    </article>`;
  }

  const order = (a, b) => (a.status === b.status ? 0 : a.status === 'proved' ? -1 : 1);
  $('theorems').innerHTML = g.plants.filter((p) => p.kind === 'theorem').sort(order).map(card).join('');
  $('lemmas').innerHTML = g.plants.filter((p) => p.kind === 'lemma').sort(order).map(card).join('');
})();
