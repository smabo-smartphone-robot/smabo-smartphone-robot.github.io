// smabo site behaviour on top of Starlight (ported from the old docs.js).
//
//  - 起動手順 popup: links to the startup guide open it in a modal, showing
//    only the steps the link lists in data-steps (comma-separated h2 ids).
//    Without JS the link is a normal page link.
//  - Top page: content blocks fade and rise into view as you scroll.
//  - Mermaid diagrams (design doc): Mermaid is loaded from a CDN only on
//    pages that have a `pre.mermaid` block.

(function () {
  if (!document.querySelector('pre.mermaid')) return;
  import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
    .then(({ default: mermaid }) => {
      mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose', fontFamily: 'inherit' });
      return mermaid.run({ querySelector: 'pre.mermaid' });
    })
    .then(() => {
      // Mermaid sometimes sizes a flowchart's viewBox from a layout that
      // differs from the drawn one, cutting off its bottom. Fit the viewBox
      // to what was actually drawn.
      const PAD = 8;
      document.querySelectorAll('pre.mermaid svg').forEach((svg) => {
        const b = svg.getBBox();
        if (!b.width || !b.height) return;
        const w = b.width + PAD * 2;
        svg.setAttribute('viewBox', `${b.x - PAD} ${b.y - PAD} ${w} ${b.height + PAD * 2}`);
        svg.style.maxWidth = `${w}px`;
      });
    })
    .catch((e) => console.error('Mermaid failed to load:', e));
})();

(function () {
  const links = Array.from(document.querySelectorAll('a[data-steps][href*="/guides/startup/"]'));
  if (links.length === 0) return;
  const isEn = (document.documentElement.lang || '').startsWith('en');
  const T = isEn
    ? { label: 'Startup Procedure', close: 'Close', loading: 'Loading…', fail: 'Could not load the steps.', open: 'Open the startup page' }
    : { label: '起動手順', close: '閉じる', loading: '読み込み中…', fail: '内容を読み込めませんでした。', open: '起動手順ページを開く' };

  let overlay = null;

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  // Starlight wraps each heading in .sl-heading-wrapper; keep a section
  // (h2 + what follows) only when its id is listed.
  function filterSteps(content, steps) {
    const keep = new Set(steps.split(',').map((s) => s.trim()).filter(Boolean));
    if (keep.size === 0) return;
    let keeping = false;
    for (const el of Array.from(content.children)) {
      const h2 = el.tagName === 'H2' ? el : el.classList.contains('level-h2') ? el.querySelector('h2') : null;
      if (h2) keeping = keep.has(h2.id);
      if (!keeping) el.remove();
    }
  }

  async function open(href, steps) {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'startup-modal';
    overlay.innerHTML =
      '<div class="startup-modal__dialog" role="dialog" aria-modal="true">' +
        '<button class="startup-modal__close" type="button">×</button>' +
        '<div class="startup-modal__body sl-markdown-content"><p class="startup-modal__loading"></p></div>' +
      '</div>';
    overlay.querySelector('[role=dialog]').setAttribute('aria-label', T.label);
    overlay.querySelector('.startup-modal__close').setAttribute('aria-label', T.close);
    overlay.querySelector('.startup-modal__loading').textContent = T.loading;
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.startup-modal__close').addEventListener('click', close);

    const body = overlay.querySelector('.startup-modal__body');
    try {
      const res = await fetch(href.split('#')[0]);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const content = doc.querySelector('main .sl-markdown-content');
      if (!content) throw new Error('no content');
      content.querySelectorAll('.sl-anchor-link').forEach((a) => a.remove());
      if (steps) filterSteps(content, steps);
      body.innerHTML = content.innerHTML;
    } catch (err) {
      body.innerHTML = '';
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = href;
      a.textContent = T.open;
      p.append(T.fail, a);
      body.appendChild(p);
    }
  }

  for (const a of links) {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(a.getAttribute('href'), a.getAttribute('data-steps'));
    });
  }
})();

(function () {
  const blocks = Array.from(document.querySelectorAll(
    '.sl-markdown-content > div[style*="text-align: center"]:not(.cta-block)'
  ));
  if (blocks.length === 0 || !('IntersectionObserver' in window)) return;
  for (const b of blocks) b.classList.add('reveal');
  const observer = new IntersectionObserver((entries, obs) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  for (const b of blocks) observer.observe(b);
})();
