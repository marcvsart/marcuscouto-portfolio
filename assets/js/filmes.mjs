// Estante de filmes. O catálogo é local (data/filmes.txt) e segue no mesmo commit das imagens.
// Formato documentado no próprio arquivo e no README.
const FRAMES = '/assets/img/filmes/';
const EN = typeof document !== 'undefined' && document.documentElement.lang === 'en';
const T = EN
  ? { channel: 'Watch the films on Zombiebasilisk ↗', watch: 'Watch the film', newTab: 'opens in a new tab', frame: 'Frame from', noLink: 'Video link unavailable' }
  : { channel: 'Assista aos filmes no Zombiebasilisk ↗', watch: 'Assistir ao filme', newTab: 'abre em nova aba', frame: 'Frame de', noLink: 'Link do vídeo indisponível' };

export function safeFilmURL(value) {
  try {
    const url = new URL(value);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}

export function parseCrop(value = '') {
  if (!value) return '50% 50%';
  const match = value.match(/^(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);
  return match && Number(match[1]) <= 100 && Number(match[2]) <= 100
    ? `${Number(match[1])}% ${Number(match[2])}%` : null;
}

export function parseFilms(source) {
  const records = [];
  const warnings = [];
  const seen = new Set();
  source.replace(/^﻿/, '').split(/\r?\n/).forEach((line, index) => {
    if (!line.trim() || line.trimStart().startsWith('#')) return;
    const fields = line.split('|').map(value => value.trim());
    const [file, title, date, keywords, url, cropValue, description = '', linkLabel = '', kind = '', credits = ''] = fields;
    if (fields.length < 5 || fields.length > 10 || !file || !title || /[\\/]/.test(file) ||
        !/\.(png|jpe?g|webp|gif|avif)$/i.test(file) || seen.has(file)) {
      warnings.push(`Linha ${index + 1}: registro inválido ou arquivo repetido.`);
      return;
    }
    seen.add(file);
    const href = safeFilmURL(url);
    if (!href) warnings.push(`Linha ${index + 1}: URL ausente ou inválida.`);
    const crop = parseCrop(cropValue);
    if (!crop) warnings.push(`Linha ${index + 1}: recorte inválido; usando o centro.`);
    records.push({ file, title, date, tags: keywords.split(',').map(tag => tag.trim()).filter(Boolean), href, crop: crop || '50% 50%', description, linkLabel, kind, credits });
  });
  return { records, warnings };
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function renderFilms(root, records) {
  root.replaceChildren();
  if (!records.length) {
    const message = element('p', 'shelf-message');
    const channel = element('a', '', T.channel);
    channel.href = 'https://www.instagram.com/zombiebasilisk/';
    channel.target = '_blank';
    channel.rel = 'noopener';
    message.append(channel);
    root.append(message);
    return;
  }

  records.forEach((film, index) => {
    const lombada = element('details', 'lombada');
    // Accordion nativo: clique, toque, Enter e espaço. Uma lombada aberta por vez.
    lombada.name = 'filmes';
    const summary = element('summary');
    const number = element('span', 'lombada-num', String(index + 1).padStart(2, '0'));
    number.setAttribute('aria-hidden', 'true');
    const identity = element('span', 'lombada-id');
    identity.append(element('span', 'lombada-titulo', film.title));
    if (film.kind) identity.append(element('span', 'lombada-tipo', `[${film.kind}]`));
    if (film.tags.length) {
      const tags = element('span', 'lombada-tags');
      film.tags.forEach(tag => tags.append(element('span', '', tag)));
      identity.append(tags);
    }
    const date = element('span', 'lombada-meta', film.date || '—');
    const toggle = element('span', 'lombada-toggle');
    toggle.setAttribute('aria-hidden', 'true');
    summary.append(number, identity, date, toggle);

    const panel = element('div', 'lombada-painel');
    if (film.description) panel.append(element('p', '', film.description));
    if (film.credits) panel.append(element('p', 'creditos', film.credits));
    const label = film.linkLabel || T.watch;
    const frame = element(film.href ? 'a' : 'div', 'film-frame');
    if (film.href) {
      frame.href = film.href;
      frame.target = '_blank';
      frame.rel = 'noopener';
      frame.setAttribute('aria-label', `${label} — ${film.title} (${T.newTab})`);
    }
    const image = element('img');
    image.alt = `${T.frame} ${film.title}`;
    image.decoding = 'async';
    image.style.objectPosition = film.crop;
    image.addEventListener('error', () => {
      image.hidden = true;
      frame.classList.add('image-unavailable');
    });
    const watch = element('span', 'film-watch');
    watch.append(element('span', '', film.href ? label : T.noLink));
    if (film.href) watch.append(element('span', '', '↗'));
    frame.append(image, watch);
    panel.append(frame);
    lombada.append(summary, panel);
    // Carrega o frame na primeira abertura. O recorte é só visual, via CSS.
    lombada.addEventListener('toggle', () => {
      if (!lombada.open) return;
      if (!image.hasAttribute('src')) image.src = FRAMES + encodeURIComponent(film.file);
      // Fallback para navegadores sem suporte a details[name].
      root.querySelectorAll('details[open]').forEach(other => { if (other !== lombada) other.open = false; });
    });
    root.append(lombada);
  });
}

export async function loadFilms(root) {
  try {
    const response = await fetch('/data/filmes.txt', { cache: 'no-cache' });
    if (!response.ok) throw new Error('Catálogo indisponível');
    const { records, warnings } = parseFilms(await response.text());
    warnings.forEach(message => console.warn('[filmes]', message));
    renderFilms(root, records);
  } catch {
    renderFilms(root, []);
  } finally {
    root.setAttribute('aria-busy', 'false');
  }
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('estante-filmes');
  if (root) loadFilms(root);
}
