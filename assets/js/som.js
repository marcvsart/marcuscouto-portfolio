// Discografia: monta os grupos e faixas a partir de data/som.json.
(function () {
  'use strict';
  const root = document.getElementById('discografia');
  const EN = document.documentElement.lang === 'en';
  if (!root) return;

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function safeURL(value) {
    try { const u = new URL(value); return /^https?:$/.test(u.protocol) ? u.href : null; } catch { return null; }
  }

  fetch('/data/som.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(grupos => {
      root.replaceChildren();
      grupos.forEach(grupo => {
        const section = el('section', 'group');
        if (grupo.id) section.id = grupo.id;
        const head = el('div', 'group-head');
        const h2 = el('h2');
        h2.append(el('span', '', grupo.grupo));
        h2.firstChild.setAttribute('data-node', '');
        const n = grupo.itens.length;
        head.append(h2, el('span', 'count', `${String(n).padStart(2, '0')} ${EN ? (n === 1 ? 'item' : 'items') : (n === 1 ? 'item' : 'itens')}`));
        section.append(head);
        grupo.itens.forEach((item, i) => {
          const url = safeURL(item.url);
          const row = el(url ? 'a' : 'div', 'track');
          if (url) { row.href = url; row.target = '_blank'; row.rel = 'noopener'; }
          const t = el('div', 't');
          if (item.artista) t.append(document.createTextNode(item.artista + ' — '));
          t.append(el('em', '', item.titulo));
          row.append(
            el('div', 'num', String(i + 1).padStart(3, '0')),
            t,
            el('div', 'notes', item.notas || '—'),
            el('div', 'type', item.tipo),
            el('div', 'y num', String(item.ano))
          );
          section.append(row);
        });
        root.append(section);
      });
      root.setAttribute('aria-busy', 'false');
      // Glitch pleno nos nomes dos grupos, depois de montados.
      document.dispatchEvent(new CustomEvent('arte:nodes'));
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    })
    .catch(() => {
      root.replaceChildren(el('p', 'shelf-message', EN ? 'The discography is temporarily unavailable.' : 'A discografia está temporariamente indisponível.'));
      root.setAttribute('aria-busy', 'false');
    });
})();
