// Pinturas: bolas flutuantes e visualizador em tela cheia.
// Lê só data/pinturas.txt (sem API do GitHub) e monta o DOM sem innerHTML.
(() => {
  'use strict';
  const IMG = '/assets/img/pinturas/';
  const EN = document.documentElement.lang === 'en';
  const T = EN
    ? { view: 'View painting: ', empty: 'The paintings are temporarily unavailable.', collect: 'collect ↗' }
    : { view: 'Ver pintura: ', empty: 'As pinturas estão temporariamente indisponíveis.', collect: 'colecionar ↗' };
  const mobileQuery = window.matchMedia('(max-width: 720px)');
  const pfield = document.getElementById('pfield');
  if (!pfield) return;
  const orbs = [];

  function safeURL(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url.href : null;
    } catch { return null; }
  }

  function parse(source) {
    return source.replace(/^﻿/, '').split(/\r?\n/)
      .filter(line => line.trim() && !line.trimStart().startsWith('#'))
      .map(line => line.split('|').map(v => v.trim()))
      .filter(([base, title]) => base && title && /^[a-z0-9-]+$/.test(base))
      .map(([base, title, medium = '', link = '', titleEn = '']) => ({ base, title: (EN && titleEn) || title, medium, link: safeURL(link) }));
  }

  function placeOrbs() {
    const W = pfield.clientWidth;
    if (!W) return;
    const mobile = mobileQuery.matches;
    // Reserva 26px para a flutuação e 14px entre as bordas das pinturas.
    const drift = 26;
    const clearance = drift + 14;
    const placed = [];
    orbs.forEach((o, index) => {
      const size = Math.min(W, mobile
        ? Math.min(260, W * (0.55 + o._scale * 0.2))
        : 180 + o._scale * 240);
      o.style.width = o.style.height = size + 'px';
      let x, y;
      if (mobile) {
        // Composição alternada: cada obra encontra espaço abaixo das anteriores.
        x = index % 2 ? W - size : 0;
        y = drift;
        placed.forEach(p => {
          const dx = (x + size / 2) - (p.x + p.s / 2);
          const distance = (size + p.s) / 2 + clearance;
          if (Math.abs(dx) < distance) {
            const below = p.y + p.s / 2 + Math.sqrt(distance ** 2 - dx ** 2) - size / 2;
            y = Math.max(y, below);
          }
        });
      } else {
        let fits = false;
        for (let tries = 0; tries < 40; tries++) {
          x = Math.random() * (W - size);
          y = drift + Math.random() * 640;
          fits = placed.every(p => Math.hypot(
            x + size / 2 - p.x - p.s / 2,
            y + size / 2 - p.y - p.s / 2
          ) >= (size + p.s) / 2 + clearance);
          if (fits) break;
        }
        // Nunca aceita uma posição sobreposta ao esgotar as tentativas.
        if (!fits) y = placed.reduce((max, p) => Math.max(max, p.y + p.s), 0) + clearance;
      }
      placed.push({ x, y, s: size });
      o.style.left = x + 'px';
      o.style.top = y + 'px';
    });
    const maxY = placed.reduce((max, p) => Math.max(max, p.y + p.s), 0);
    pfield.style.height = (maxY + 40) + 'px';
  }

  function buildOrb(painting) {
    const o = document.createElement('button');
    o.type = 'button';
    o.className = 'orb';
    o._scale = Math.random();
    const orb = IMG + painting.base + '-orb';
    o.style.backgroundImage = `url("${orb}.webp")`;
    o.style.backgroundImage = `image-set(url("${orb}.avif") type("image/avif"), url("${orb}.webp") type("image/webp"))`;
    o.style.setProperty('--dur', (6 + Math.random() * 7).toFixed(1) + 's');
    o.style.setProperty('--delay', (-Math.random() * 8).toFixed(1) + 's');
    o.style.setProperty('--drift', (-(10 + Math.random() * 16)).toFixed(0) + 'px');
    o.setAttribute('aria-label', T.view + painting.title);
    o.addEventListener('click', () => openViewer(painting));
    orbs.push(o);
    pfield.appendChild(o);
  }

  async function loadPaintings() {
    try {
      const response = await fetch('/data/pinturas.txt', { cache: 'no-cache' });
      if (!response.ok) throw new Error('indisponível');
      const paintings = parse(await response.text());
      if (!paintings.length) throw new Error('vazio');
      paintings.forEach(buildOrb);
      placeOrbs();
    } catch {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = T.empty;
      pfield.replaceChildren(empty);
      pfield.style.height = 'auto';
    }
  }
  loadPaintings();
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth !== lastWidth && orbs.length) { lastWidth = window.innerWidth; placeOrbs(); }
  });

  // ---- visualizador em tela cheia ---------------------------------------
  const viewer = document.getElementById('viewer');
  const viewerPicture = document.getElementById('viewerPicture');
  const viewerCap = document.getElementById('viewerCap');
  const page = document.getElementById('page');
  let viewerTrigger = null;

  function openViewer(painting) {
    viewerTrigger = document.activeElement;
    if (page) page.inert = true;
    const full = IMG + painting.base + '-full';
    const avif = document.createElement('source');
    avif.type = 'image/avif';
    avif.srcset = full + '.avif';
    const img = document.createElement('img');
    img.src = full + '.webp';
    img.alt = painting.title;
    viewerPicture.replaceChildren(avif, img);

    const caption = [document.createTextNode(`“${painting.title}”`)];
    if (painting.medium) caption.push(document.createTextNode(` — ${painting.medium}`));
    if (painting.link) {
      const link = document.createElement('a');
      link.href = painting.link;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = T.collect;
      caption.push(document.createTextNode(' · '), link);
    }
    viewerCap.replaceChildren(...caption);
    viewer.classList.add('on');
    viewer.querySelector('.close').focus();
  }

  function closeViewer() {
    if (!viewer.classList.contains('on')) return;
    viewer.classList.remove('on');
    viewerPicture.replaceChildren();
    if (page) page.inert = false;
    viewerTrigger?.focus();
  }

  viewer.addEventListener('click', event => { if (event.target.closest('a')) return; closeViewer(); });
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeViewer();
    if (event.key === 'Tab' && viewer.classList.contains('on')) {
      const focusable = [...viewer.querySelectorAll('button, a[href]')];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
})();
