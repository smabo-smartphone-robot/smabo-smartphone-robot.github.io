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
