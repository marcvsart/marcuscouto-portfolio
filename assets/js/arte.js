// Arte: glitch pleno do marcvs.art (fatias rasgando, intensidade e frequência originais)
// e scramble de texto. Elementos:
//   [data-node]        → glitch sozinho a cada 9–18s, glitch + scramble no hover
//   .page-head h1      → glitch no hover
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ---- motor de corrupção: caracteres viram glifos de bloco/ruído e se recompõem
  const GLYPHS = '█▓▒░<>/\\|#%&@*+=~^?!;:01';
  const rg = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  function scrambleResolve(el, original, dur) {
    if (!el || el._scr) return;
    const t0 = performance.now();
    el._scr = setInterval(() => {
      const k = Math.min(1, (performance.now() - t0) / dur);
      const p = (1 - k) * 0.85; // começa quase tudo corrompido
      let out = '';
      for (const c of original) out += (c === ' ' || Math.random() > p) ? c : rg();
      el.textContent = out;
      if (k >= 1) stopScramble(el, original);
    }, 34);
  }
  function stopScramble(el, original) {
    if (!el) return;
    clearInterval(el._scr); el._scr = null;
    el.textContent = original;
  }

  function slice(el) {
    el.classList.remove('glitching'); void el.offsetWidth;
    el.classList.add('glitching');
  }

  const h1 = document.querySelector('.page-head h1');
  if (h1) h1.addEventListener('mouseenter', () => slice(h1));

  // Nós montados depois (ex.: discografia) avisam com o evento 'arte:nodes'.
  function bindNodes() {
    document.querySelectorAll('[data-node]').forEach(bindNode);
  }
  document.addEventListener('arte:nodes', bindNodes);
  bindNodes();

  function bindNode(el) {
    if (el._bound) return;
    el._bound = true;
    const original = el.textContent;
    el.setAttribute('aria-label', original);
    const target = el.closest('a') || el;
    target.addEventListener('mouseenter', () => { slice(el); scrambleResolve(el, original, 420); });
    target.addEventListener('mouseleave', () => stopScramble(el, original));
    const schedule = () => {
      setTimeout(() => { slice(el); schedule(); }, (9 + Math.random() * 9) * 1000);
    };
    setTimeout(schedule, 1500 + Math.random() * 4000);
  }
})();
