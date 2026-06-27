// Documentation pages: render Mermaid diagrams (if any) and highlight the
// table-of-contents entry for the section currently in view.
//
// Mermaid is loaded from a CDN only when the page actually contains a
// `.mermaid` block, so diagram-free docs pay no cost.

(function () {
  // --- Mermaid (lazy, CDN) ---------------------------------------------
  if (document.querySelector('.mermaid')) {
    import('https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs')
      .then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });
        // Mermaid is imported lazily (after the load event), so `startOnLoad`
        // would never fire — render the .mermaid blocks explicitly instead.
        return mermaid.run();
      })
      .catch((e) => console.error('Mermaid failed to load:', e));
  }

  // --- TOC scroll-spy ---------------------------------------------------
  const links = Array.from(document.querySelectorAll('.doc-toc a[href^="#"]'));
  if (links.length === 0) return;

  const byId = new Map();
  for (const a of links) byId.set(decodeURIComponent(a.hash.slice(1)), a);

  const headings = Array.from(document.querySelectorAll('.doc-content h2, .doc-content h3'))
    .filter((h) => h.id && byId.has(h.id));
  if (headings.length === 0) return;

  const setActive = (id) => {
    for (const a of links) a.classList.toggle('is-active', a === byId.get(id));
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(entry.target.id);
      }
    },
    { rootMargin: '-70px 0px -70% 0px', threshold: 0 }
  );
  for (const h of headings) observer.observe(h);
})();

// --- Startup-procedure popup --------------------------------------------
// Links to startup.html open the 起動手順 in a modal instead of navigating
// away. Progressive enhancement: without JS the link is a normal page link.
(function () {
  const links = Array.from(document.querySelectorAll('a[href$="startup.html"]'));
  if (links.length === 0) return;

  let overlay = null;

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  async function open(href) {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'startup-modal';
    overlay.innerHTML =
      '<div class="startup-modal__dialog" role="dialog" aria-modal="true" aria-label="起動手順">' +
        '<button class="startup-modal__close" type="button" aria-label="閉じる">×</button>' +
        '<div class="startup-modal__body"><p class="startup-modal__loading">読み込み中…</p></div>' +
      '</div>';
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('.startup-modal__close').addEventListener('click', close);

    const body = overlay.querySelector('.startup-modal__body');
    try {
      const res = await fetch(href);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      const content = doc.querySelector('.doc-content');
      if (!content) throw new Error('no content');
      content.querySelectorAll('.headerlink').forEach((a) => a.remove());
      body.innerHTML = '';
      body.appendChild(content);
    } catch (err) {
      body.innerHTML =
        '<p>内容を読み込めませんでした。<a href="' + href + '">起動手順ページを開く</a></p>';
    }
  }

  for (const a of links) {
    a.addEventListener('click', (e) => {
      // Let modifier / non-left clicks open the page normally (new tab etc.).
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      open(a.getAttribute('href'));
    });
  }
})();
